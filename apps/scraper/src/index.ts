import { scrapeDevpost } from './sources/devpost'

export default {
  async scheduled() {
    const events = await scrapeDevpost()
    console.log(`Fetched ${events.length} open Devpost records`)
  },
} satisfies ExportedHandler
