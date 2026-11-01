import { scrapeDevpost } from './sources/devpost'
import { normalizeDevpostEvent } from './normalizers/devpost'
import { createDb } from '@repo/db/client'
import { upsertEvents } from '@repo/db/queries/events'

interface Env {
  DB: D1Database
}

export default {
  async scheduled(_controller, env) {
    if (!env.DB) throw new Error('Scraper requires a D1 binding named DB')
    const scrapedAt = new Date().toISOString()
    const rawEvents = await scrapeDevpost()
    const events = rawEvents.map((event) => normalizeDevpostEvent(event, scrapedAt))
    const processed = await upsertEvents(createDb(env.DB), events)
    console.log(`Processed ${processed} open/upcoming Devpost records`)
  },
} satisfies ExportedHandler<Env>
