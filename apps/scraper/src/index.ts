import { scrapeDevpost } from './sources/devpost'
import { normalizeDevpostEvent } from './normalizers/devpost'
import { createDb } from '@repo/db/client'
import { upsertEvents } from '@repo/db/queries/events'
import { parseImageBaseUrl, storeEventImages } from './storage/images'
import { RequestBudget } from './request-budget'

interface Env {
  DB: D1Database
  EVENT_IMAGES: R2Bucket
  IMAGE_PUBLIC_BASE_URL: string
}

export default {
  async scheduled(_controller, env) {
    if (!env.DB) throw new Error('Scraper requires a D1 binding named DB')
    if (!env.EVENT_IMAGES) throw new Error('Scraper requires an R2 binding named EVENT_IMAGES')
    if (!env.IMAGE_PUBLIC_BASE_URL) throw new Error('Scraper requires IMAGE_PUBLIC_BASE_URL')
    const publicBaseUrl = parseImageBaseUrl(env.IMAGE_PUBLIC_BASE_URL)
    const scrapedAt = new Date().toISOString()
    const budget = new RequestBudget()
    const rawEvents = await scrapeDevpost(budget)
    const events = rawEvents.map((event) => normalizeDevpostEvent(event, scrapedAt))
    const storedEvents = await storeEventImages(events, env.EVENT_IMAGES, publicBaseUrl, budget)
    const processed = await upsertEvents(createDb(env.DB), storedEvents)
    const pendingImages = storedEvents.filter((event, index) => !event.imageUrl && events[index]?.imageUrl).length
    console.log(`Processed ${processed} open/upcoming Devpost records; ${pendingImages} images pending`)
  },
} satisfies ExportedHandler<Env>
