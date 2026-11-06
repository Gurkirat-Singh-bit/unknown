import { afterEach, expect, test } from 'bun:test'
import { scrapeDevpost } from '../src/sources/devpost'
import { normalizeDevpostEvent } from '../src/normalizers/devpost'
import { devpostEventSchema } from '@repo/core/schemas/devpost'
import { RequestBudget } from '../src/request-budget'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

const event = (id: number, status: 'open' | 'upcoming' | 'ended' = 'open') => ({
  id, title: `Event ${id}`, url: `https://event-${id}.devpost.com/`, open_state: status,
})
const page = (hackathons: unknown[], total: number, perPage = 2) => Response.json({
  hackathons, meta: { total_count: total, per_page: perPage },
})

function mockResponses(responses: Response[]) {
  const urls: URL[] = []
  globalThis.fetch = (async (input: string | URL | Request) => {
    urls.push(new URL(String(input)))
    const response = responses.shift()
    if (!response) throw new Error('Unexpected extra request')
    return response
  }) as typeof fetch
  return urls
}

test('collects open and upcoming listings across pages, deduplicating stable IDs', async () => {
  const urls = mockResponses([
    page([event(1), event(2, 'upcoming')], 3),
    page([event(2, 'upcoming'), event(3)], 3),
  ])
  const records = await scrapeDevpost()
  expect(records.map((record) => record.id)).toEqual([1, 2, 3])
  expect(records[1]?.open_state).toBe('upcoming')
  expect(urls.map((url) => url.searchParams.get('page'))).toEqual(['1', '2'])
  expect(urls.every((url) => url.searchParams.getAll('status[]').join(',') === 'open,upcoming')).toBe(true)
})

test('accepts a valid empty catalogue', async () => {
  mockResponses([page([], 0)])
  expect(await scrapeDevpost()).toEqual([])
})

test('never fetches beyond its request budget or accepts partial collection', async () => {
  const urls = mockResponses([page([event(1), event(2)], 3)])
  await expect(scrapeDevpost(new RequestBudget(1))).rejects.toThrow('request budget')
  expect(urls).toHaveLength(1)
})

test('rejects HTTP failures and HTML challenge pages', async () => {
  const urls = mockResponses([new Response('rate limited', { status: 429 })])
  await expect(scrapeDevpost()).rejects.toThrow('HTTP 429')
  expect(urls).toHaveLength(1)
  mockResponses([new Response('<html>Verify</html>', { headers: { 'content-type': 'text/html' } })])
  await expect(scrapeDevpost()).rejects.toThrow('did not return JSON')
})

test('rejects redirects without following them or spending another request', async () => {
  let calls = 0
  globalThis.fetch = (async (_input: string | URL | Request, options?: RequestInit) => {
    calls++
    expect(options?.redirect).toBe('manual')
    return new Response(null, { status: 302, headers: { location: 'https://example.com/other' } })
  }) as typeof fetch
  await expect(scrapeDevpost()).rejects.toThrow('HTTP 302')
  expect(calls).toBe(1)
})

test('rejects invalid JSON and invalid page structures', async () => {
  mockResponses([new Response('{', { headers: { 'content-type': 'application/json' } })])
  await expect(scrapeDevpost()).rejects.toThrow()
  mockResponses([Response.json({ hackathons: [] })])
  await expect(scrapeDevpost()).rejects.toThrow('unexpected response shape')
})

test('does not return a partial result after a short or repeated page', async () => {
  mockResponses([page([event(1)], 3)])
  await expect(scrapeDevpost()).rejects.toThrow('before all records')
  mockResponses([page([event(1), event(2)], 3), page([event(1), event(2)], 3)])
  await expect(scrapeDevpost()).rejects.toThrow('before all records')
})

test('rejects ended listings and inconsistent reported totals', async () => {
  mockResponses([page([event(1, 'ended')], 1)])
  await expect(scrapeDevpost()).rejects.toThrow('outside the requested status')
  mockResponses([page([event(1), event(2)], 1)])
  await expect(scrapeDevpost()).rejects.toThrow('result count changed')
})

test('normalization preserves submission dates, upcoming status, and unknown actual dates', () => {
  const raw = devpostEventSchema.parse({
    ...event(1, 'upcoming'), displayed_location: { location: 'Online' },
    submission_period_dates: 'Dec 19, 2026 - Jan 18, 2027',
    thumbnail_url: '//example.com/image.png', prize_amount: '$<span>1,000</span>',
    themes: [{ name: 'AI' }, { name: ' AI ' }],
  })
  const normalized = normalizeDevpostEvent(raw, '2026-11-01T12:00:00Z')
  expect(normalized.status).toBe('upcoming')
  expect(normalized.mode).toBe('online')
  expect(normalized.startsAt).toBeNull()
  expect(normalized.endsAt).toBeNull()
  expect(normalized.submissionPeriod).toBe('Dec 19, 2026 - Jan 18, 2027')
  expect(normalized.imageUrl).toBe('https://example.com/image.png')
  expect(normalized.tags).toEqual(['AI'])
  expect(normalized.prizeText).toBe('$1,000')
})

test('normalization does not invent structured locations or allow executable image URLs', () => {
  const raw = devpostEventSchema.parse({ ...event(1), displayed_location: { location: 'London' } })
  const normalized = normalizeDevpostEvent(raw, '2026-11-01T12:00:00Z')
  expect(normalized.city).toBeNull()
  expect(normalized.country).toBeNull()
  expect(normalized.mode).toBe('unknown')
  expect(() => normalizeDevpostEvent({ ...raw, thumbnail_url: 'javascript:alert(1)' }, '2026-11-01T12:00:00Z')).toThrow()
})
