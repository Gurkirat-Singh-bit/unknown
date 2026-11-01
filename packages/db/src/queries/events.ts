import { and, asc, eq, gte, lte, ne, or, sql } from 'drizzle-orm'
import { eventSchema, type EventInput, type EventRecord } from '@repo/core/schemas/event'
import { eventFiltersSchema, type EventFiltersInput } from '@repo/core/schemas/event-filters'
import type { Database } from '../client'
import { events } from '../schema'

export async function listEvents(db: Database, input: EventFiltersInput = {}): Promise<EventRecord[]> {
  const filters = eventFiltersSchema.parse(input)
  const conditions = []

  if (filters.q) {
    conditions.push(sql`instr(lower(${events.title}), lower(${filters.q})) > 0`)
  }
  if (filters.source) conditions.push(eq(events.source, filters.source))
  if (filters.type) conditions.push(eq(events.type, filters.type))
  if (filters.mode) conditions.push(eq(events.mode, filters.mode))
  if (filters.status) conditions.push(eq(events.status, filters.status))
  if (filters.city) conditions.push(eq(events.city, filters.city))
  if (filters.country) conditions.push(eq(events.country, filters.country))
  if (filters.startsAfter) conditions.push(gte(events.startsAt, filters.startsAfter))
  if (filters.startsBefore) conditions.push(lte(events.startsAt, filters.startsBefore))
  if (filters.activeOnly) {
    conditions.push(ne(events.status, 'ended'))
    conditions.push(or(sql`${events.endsAt} IS NULL`, gte(events.endsAt, new Date().toISOString())))
  }

  return db.select().from(events).where(and(...conditions))
    .orderBy(asc(sql`${events.startsAt} IS NULL`), asc(events.startsAt), asc(events.id))
    .limit(filters.limit).offset(filters.offset).all()
}

export async function upsertEvents(db: Database, input: EventInput[]): Promise<number> {
  const validated = input.map((event) => eventSchema.parse(event))
  const now = new Date().toISOString()

  for (let offset = 0; offset < validated.length; offset += 50) {
    const statements = validated.slice(offset, offset + 50).map((event) => db.insert(events)
      .values({ ...event, id: `${event.source}:${event.sourceId}`, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: [events.source, events.sourceId],
        set: { ...event, updatedAt: now },
        setWhere: lte(events.scrapedAt, event.scrapedAt),
      }))
    const [first, ...rest] = statements
    if (first) await db.batch([first, ...rest])
  }

  return validated.length
}
