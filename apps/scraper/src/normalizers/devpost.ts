import type { DevpostEvent } from '@repo/core/schemas/devpost'
import { eventSchema, type Event } from '@repo/core/schemas/event'

export function normalizeDevpostEvent(raw: DevpostEvent, scrapedAt: string): Event {
  const location = raw.displayed_location?.location.trim() || null
  const imageUrl = raw.thumbnail_url?.trim()
  const prizeText = raw.prize_amount?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

  return eventSchema.parse({
    source: 'devpost',
    sourceId: String(raw.id),
    sourceUrl: raw.url,
    title: raw.title,
    type: 'hackathon',
    mode: location?.toLowerCase() === 'online' ? 'online' : 'unknown',
    status: raw.open_state,
    location,
    submissionPeriod: raw.submission_period_dates?.trim() || null,
    organizer: raw.organization_name?.trim() || null,
    imageUrl: imageUrl ? new URL(imageUrl, 'https://devpost.com').href : null,
    tags: [...new Set(raw.themes.map((theme) => theme.name.trim()).filter(Boolean))],
    prizeText: prizeText || null,
    scrapedAt,
  })
}
