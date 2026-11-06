import { sources } from '@repo/config/sources'
import { devpostPageSchema, type DevpostEvent } from '@repo/core/schemas/devpost'
import { RequestBudget } from '../request-budget'

export async function scrapeDevpost(budget = new RequestBudget()): Promise<DevpostEvent[]> {
  const config = sources.devpost
  const events = new Map<number, DevpostEvent>()

  for (let page = 1; page <= config.maxPages; page++) {
    if (page > 1) {
      await new Promise((resolve) => setTimeout(resolve, config.pageDelayMs))
    }

    const url = new URL(config.url)
    for (const status of config.statuses) {
      url.searchParams.append('status[]', status)
    }
    url.searchParams.set('page', String(page))

    if (!budget.take()) throw new Error('Devpost collection exhausted its external request budget')
    const response = await fetch(url, {
      signal: AbortSignal.timeout(config.requestTimeoutMs),
      redirect: 'manual',
    })

    if (!response.ok) {
      throw new Error(`Devpost page ${page} request failed: HTTP ${response.status}`)
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error(`Devpost page ${page} did not return JSON`)
    }

    const result = devpostPageSchema.safeParse(await response.json())

    if (!result.success) {
      throw new Error(`Devpost page ${page} has an unexpected response shape`, {
        cause: result.error,
      })
    }

    const { hackathons, meta } = result.data
    const unexpected = hackathons.filter((event) => !config.statuses.some((status) => status === event.open_state))
    if (unexpected.length) {
      throw new Error(`Devpost page ${page} returned records outside the requested status: ${unexpected.map((event) => `${event.id}:${event.open_state}`).join(', ')}`)
    }
    const previousCount = events.size

    for (const event of hackathons) {
      events.set(event.id, event)
    }

    if (page === 1 && meta.total_count === 0 && hackathons.length === 0) {
      return []
    }

    if (events.size === meta.total_count && meta.total_count > 0) {
      return [...events.values()]
    }

    if (events.size > meta.total_count) {
      throw new Error(`Devpost result count changed during collection on page ${page}`)
    }

    if (events.size === previousCount || hackathons.length < meta.per_page) {
      throw new Error(`Devpost pagination ended before all records were collected on page ${page}`)
    }
  }

  throw new Error(`Devpost collection exceeded its ${config.maxPages}-page limit`)
}
