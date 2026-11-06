import { scrapeDevpost } from './sources/devpost'
import { normalizeDevpostEvent } from './normalizers/devpost'
import { createDb } from '@repo/db/client'
import { upsertEvents } from '@repo/db/queries/events'
import { parseImageBaseUrl, storeEventImages } from './storage/images'
import { RequestBudget } from './request-budget'
import { createKvImageStorage, serveKvImage } from './storage/kv-images'

interface Env {
  DB: D1Database
  EVENT_IMAGES?: R2Bucket
  EVENT_IMAGES_KV?: KVNamespace
  IMAGE_PUBLIC_BASE_URL: string
}

export default {
  async fetch(request: Request, env) {
    if (!env.EVENT_IMAGES_KV) return new Response('Not found', { status: 404 })
    return serveKvImage(request, env.EVENT_IMAGES_KV)
  },
  async scheduled(_controller, env) {
    if (!env.DB) throw new Error('Scraper requires a D1 binding named DB')
    if (!env.EVENT_IMAGES_KV && !env.EVENT_IMAGES) throw new Error('Scraper requires EVENT_IMAGES_KV (or local EVENT_IMAGES)')
    if (!env.IMAGE_PUBLIC_BASE_URL) throw new Error('Scraper requires IMAGE_PUBLIC_BASE_URL')
    const publicBaseUrl = parseImageBaseUrl(env.IMAGE_PUBLIC_BASE_URL)
    const storage = env.EVENT_IMAGES_KV ? await createKvImageStorage(env.EVENT_IMAGES_KV) : env.EVENT_IMAGES!
    const scrapedAt = new Date().toISOString()
    const budget = new RequestBudget()
    const rawEvents = await scrapeDevpost(budget)
    const events = rawEvents.map((event) => normalizeDevpostEvent(event, scrapedAt))
    const storedEvents = await storeEventImages(events, storage, publicBaseUrl, budget)
    const processed = await upsertEvents(createDb(env.DB), storedEvents)
    const pendingImages = storedEvents.filter((event, index) => !event.imageUrl && events[index]?.imageUrl).length
    console.log(`Processed ${processed} open/upcoming Devpost records; ${pendingImages} images pending`)
  },
} satisfies ExportedHandler<Env>
