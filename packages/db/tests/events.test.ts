import { afterAll, beforeAll, beforeEach, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { Miniflare } from 'miniflare'
import { createDb, type Database } from '../src/client'
import { listEvents, upsertEvents } from '../src/queries/events'
import { eventRecordSchema, eventSchema, type EventInput } from '@repo/core/schemas/event'
import { eventFiltersSchema } from '@repo/core/schemas/event-filters'

const runtime = new Miniflare({
  modules: true,
  script: 'export default { fetch() { return new Response("ok") } }',
  compatibilityDate: '2026-07-30',
  d1Databases: { DB: 'events-tests' },
})

let binding: Awaited<ReturnType<typeof runtime.getD1Database>>
let db: Database

beforeAll(async () => {
  binding = await runtime.getD1Database('DB')
  const migration = readFileSync(new URL('../migrations/0000_events.sql', import.meta.url), 'utf8')
  for (const statement of migration.split('--> statement-breakpoint')) {
    if (statement.trim()) await binding.prepare(statement).run()
  }
  db = createDb(binding)
})

beforeEach(async () => {
  await binding.prepare('DELETE FROM events').run()
})

afterAll(async () => { await runtime.dispose() })

const event = (overrides: Partial<EventInput> = {}): EventInput => ({
  source: 'devpost', sourceId: '1', sourceUrl: 'https://example.devpost.com/',
  title: 'AI Hackathon', type: 'hackathon', mode: 'online', status: 'open',
  tags: ['AI'], scrapedAt: '2026-11-01T12:00:00Z', ...overrides,
})

test('upsert preserves identity and creation time, updates tags, and ignores older observations', async () => {
  await upsertEvents(db, [event()])
  const [first] = await listEvents(db)
  expect(eventRecordSchema.parse(first).id).toBe('devpost:1')
  await upsertEvents(db, [event({ title: 'Updated', tags: ['Web'], scrapedAt: '2026-11-01T13:00:00Z' })])
  await upsertEvents(db, [event({ title: 'Stale', scrapedAt: '2026-11-01T11:00:00Z' })])
  const rows = await listEvents(db)
  expect(rows).toHaveLength(1)
  expect(rows[0]?.title).toBe('Updated')
  expect(rows[0]?.tags).toEqual(['Web'])
  expect(rows[0]?.createdAt).toBe(first?.createdAt)
})

test('validates the whole input before writing any rows', async () => {
  await expect(upsertEvents(db, [event(), event({ sourceId: '2', title: '' })])).rejects.toThrow()
  expect(await listEvents(db)).toEqual([])
  expect(await upsertEvents(db, [])).toBe(0)
})

test('hides ended and expired events while preserving unknown dates', async () => {
  await upsertEvents(db, [
    event(),
    event({ sourceId: '2', status: 'ended' }),
    event({ sourceId: '3', endsAt: '2000-01-01T00:00:00Z' }),
  ])
  expect(await listEvents(db)).toHaveLength(1)
  expect(await listEvents(db, { activeOnly: 'false' })).toHaveLength(3)
})

test('filters use bound values, literal title search, source identity and bounded pagination', async () => {
  await upsertEvents(db, [event({ title: '100% AI', city: 'London', country: 'UK' }), event({ sourceId: '2', mode: 'in_person' })])
  expect(await listEvents(db, { q: '%', city: 'London', country: 'UK', source: 'devpost', mode: 'online' })).toHaveLength(1)
  expect(await listEvents(db, { q: "' OR 1=1 --" })).toHaveLength(0)
  expect(await listEvents(db, { limit: '1', offset: '1' })).toHaveLength(1)
  await expect(listEvents(db, { limit: 101 })).rejects.toThrow()
})

test('normalizes timezone offsets and rejects reversed dates and invalid booleans', () => {
  expect(eventSchema.parse(event({ startsAt: '2026-11-01T12:00:00+05:30' })).startsAt).toBe('2026-11-01T06:30:00.000Z')
  expect(eventSchema.safeParse(event({ startsAt: '2026-11-02T00:00:00Z', endsAt: '2026-11-01T00:00:00Z' })).success).toBe(false)
  expect(eventFiltersSchema.parse({ activeOnly: 'false' }).activeOnly).toBe(false)
  expect(eventFiltersSchema.safeParse({ activeOnly: 'no' }).success).toBe(false)
  expect(eventFiltersSchema.safeParse({ startsAfter: '2026-11-02T00:00:00Z', startsBefore: '2026-11-01T00:00:00Z' }).success).toBe(false)
})

test('supports more than one write batch and independent identities across sources', async () => {
  const rows = Array.from({ length: 51 }, (_, i) => event({ sourceId: String(i + 1) }))
  await upsertEvents(db, [...rows, event({ source: 'another-source' })])
  expect(await listEvents(db, { limit: 100 })).toHaveLength(52)
})
