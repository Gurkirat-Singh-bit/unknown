import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { Miniflare } from 'miniflare'
import { images } from '@repo/config/images'
import { eventSchema } from '@repo/core/schemas/event'
import { createDb } from '@repo/db/client'
import { listEvents } from '@repo/db/queries/events'
import { parseImageBaseUrl, storeEventImage, storeEventImages } from '../src/storage/images'
import { RequestBudget } from '../src/request-budget'
import worker from '../src/index'

const runtime = new Miniflare({
  modules: true,
  script: 'export default { fetch() { return new Response("ok") } }',
  compatibilityDate: '2026-07-30',
  r2Buckets: ['EVENT_IMAGES'],
  d1Databases: { DB: 'image-tests' },
})
let bucket: R2Bucket
let db: D1Database
const baseUrl = parseImageBaseUrl('https://images.example.com')
const originalFetch = globalThis.fetch
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
const event = (path: string) => eventSchema.parse({
  source: 'devpost', sourceId: '1', title: 'Example', type: 'hackathon',
  sourceUrl: 'https://example.devpost.com/', imageUrl: `https://cdn.example.com/${path}`,
  scrapedAt: '2026-11-01T12:00:00Z',
})

beforeAll(async () => {
  bucket = await runtime.getR2Bucket('EVENT_IMAGES') as unknown as R2Bucket
  db = await runtime.getD1Database('DB')
  const migration = readFileSync(new URL('../../../packages/db/migrations/0000_events.sql', import.meta.url), 'utf8')
  for (const statement of migration.split('--> statement-breakpoint')) {
    if (statement.trim()) await db.prepare(statement).run()
  }
})
afterEach(() => { globalThis.fetch = originalFetch })
afterAll(async () => { await runtime.dispose() })

test('stores bytes and serving metadata in R2, then reuses the object without downloading', async () => {
  let downloads = 0
  globalThis.fetch = (async (_input: string | URL | Request) => {
    downloads++
    return new Response(png, { headers: { 'content-type': 'image/png' } })
  }) as typeof fetch
  const stored = await storeEventImage(event('cached.png'), bucket, baseUrl)
  expect(stored.imageUrl).toMatch(/^https:\/\/images.example.com\/events\/devpost\/[a-f0-9]{64}$/)
  const key = new URL(stored.imageUrl!).pathname.slice(1)
  const object = await bucket.get(key)
  expect(new Uint8Array(await object!.arrayBuffer())).toEqual(png)
  expect(object?.httpMetadata?.contentType).toBe('image/png')
  expect(object?.httpMetadata?.cacheControl).toBe(images.cacheControl)
  expect(object?.customMetadata?.sourceUrl).toBe(event('cached.png').imageUrl!)
  expect((await storeEventImage(event('cached.png'), bucket, baseUrl)).imageUrl).toBe(stored.imageUrl)
  expect(downloads).toBe(1)
  expect((await storeEventImage(event('changed.png'), bucket, baseUrl)).imageUrl).not.toBe(stored.imageUrl)
})

test('refreshes an old object and retains its public URL', async () => {
  globalThis.fetch = (async (_input: string | URL | Request) => new Response(png, { headers: { 'content-type': 'image/png' } })) as typeof fetch
  const stored = await storeEventImage(event('refresh.png'), bucket, baseUrl)
  const key = new URL(stored.imageUrl!).pathname.slice(1)
  await bucket.put(key, 'old bytes', { customMetadata: { fetchedAt: '2000-01-01T00:00:00Z' } })
  expect((await storeEventImage(event('refresh.png'), bucket, baseUrl)).imageUrl).toBe(stored.imageUrl)
  expect(new Uint8Array(await (await bucket.get(key))!.arrayBuffer())).toEqual(png)
})

test('missing images stay null without fetching', async () => {
  globalThis.fetch = Object.assign(async () => { throw new Error('Unexpected download') }, { preconnect: originalFetch.preconnect }) as typeof fetch
  expect((await storeEventImage({ ...event('none'), imageUrl: null }, bucket, baseUrl)).imageUrl).toBeNull()
})

test('rejects HTTP failures, HTML/SVG, empty images, redirects and insecure URLs', async () => {
  for (const response of [
    new Response('limited', { status: 429 }),
    new Response('<html>Challenge</html>', { headers: { 'content-type': 'text/html' } }),
    new Response('<svg/>', { headers: { 'content-type': 'image/svg+xml' } }),
    new Response(null, { headers: { 'content-type': 'image/png' } }),
    new Response(new Uint8Array(), { headers: { 'content-type': 'image/png' } }),
  ]) {
    globalThis.fetch = (async (_input: string | URL | Request) => response) as typeof fetch
    await expect(storeEventImage(event('invalid'), bucket, baseUrl)).rejects.toThrow()
  }
  globalThis.fetch = Object.assign(async (_input: string | URL | Request, options?: RequestInit) => {
    expect(options?.redirect).toBe('manual')
    return new Response(null, { status: 302, headers: { location: 'https://cdn.example.com/other.png' } })
  }, { preconnect: originalFetch.preconnect }) as typeof fetch
  await expect(storeEventImage(event('redirect'), bucket, baseUrl)).rejects.toThrow('HTTP 302')
  await expect(storeEventImage({ ...event('http'), imageUrl: 'http://cdn.example.com/image' }, bucket, baseUrl)).rejects.toThrow('HTTPS')
})

test('bounds image size even when Content-Length is missing or misleading', async () => {
  for (const headers of [
    { 'content-type': 'image/png', 'content-length': String(images.maxBytes + 1) },
    { 'content-type': 'image/png' },
    { 'content-type': 'image/png', 'content-length': '1' },
  ] as Record<string, string>[]) {
    globalThis.fetch = (async (_input: string | URL | Request) => new Response(new Uint8Array(images.maxBytes + 1), { headers })) as typeof fetch
    await expect(storeEventImage(event('oversized'), bucket, baseUrl)).rejects.toThrow('size limit')
  }
})

test('validates public URL configuration and rejects path prefixes', () => {
  expect(parseImageBaseUrl('https://images.example.com').href).toBe('https://images.example.com/')
  expect(parseImageBaseUrl('https://images.example.com/').href).toBe('https://images.example.com/')
  for (const value of ['http://images.example.com', 'https://user:pass@example.com', 'https://example.com?q=1', 'https://example.com/#hash']) {
    expect(() => parseImageBaseUrl(value)).toThrow()
  }
  for (const path of ['/assets', '/assets/', '/assets/nested/', '//', '/%61ssets/']) {
    expect(() => parseImageBaseUrl(`https://images.example.com${path}`)).toThrow('without a path prefix')
  }
})

test('accepted public base URLs address the uploaded R2 object directly', async () => {
  globalThis.fetch = (async (_input: string | URL | Request) => new Response(png, { headers: { 'content-type': 'image/png' } })) as typeof fetch
  for (const base of ['https://images.example.com', 'https://images.example.com/']) {
    const stored = await storeEventImage(event('public-key-alignment.png'), bucket, parseImageBaseUrl(base))
    const publicUrl = new URL(stored.imageUrl!)
    const object = await bucket.get(publicUrl.pathname.slice(1))
    expect(publicUrl.origin).toBe('https://images.example.com')
    expect(object).not.toBeNull()
    expect(new Uint8Array(await object!.arrayBuffer())).toEqual(png)
  }
})

test('scheduled flow persists R2 URLs and still updates event data when a new image fails', async () => {
  const listing = {
    id: 123, title: 'Stored image', url: 'https://example.devpost.com/', open_state: 'open',
    thumbnail_url: '//cdn.example.com/integration.png',
  }
  let failImage = false
  globalThis.fetch = (async (input) => {
    if (new URL(String(input)).hostname === 'devpost.com') {
      return Response.json({ hackathons: [listing], meta: { total_count: 1, per_page: 9 } })
    }
    return failImage ? new Response('limited', { status: 429 }) : new Response(png, { headers: { 'content-type': 'image/png' } })
  }) as typeof fetch
  const env = { DB: db, EVENT_IMAGES: bucket, IMAGE_PUBLIC_BASE_URL: baseUrl.href }
  await worker.scheduled({} as ScheduledController, env)
  const [stored] = await listEvents(createDb(db))
  expect(stored?.imageUrl?.startsWith(baseUrl.href)).toBe(true)
  const key = new URL(stored!.imageUrl!).pathname.slice(1)
  expect(await bucket.head(key)).not.toBeNull()
  failImage = true
  listing.title = 'Updated despite image failure'
  listing.thumbnail_url = '//cdn.example.com/failed-integration.png'
  await worker.scheduled({} as ScheduledController, env)
  const [updated] = await listEvents(createDb(db))
  expect(updated?.title).toBe(listing.title)
  expect(updated?.imageUrl).toBeNull()
  expect(await bucket.head(key)).not.toBeNull()
})

test('shares the 50-request budget and fills missing thumbnails across subsequent runs', async () => {
  let downloads = 0
  globalThis.fetch = (async (_input: string | URL | Request) => {
    downloads++
    return new Response(png, { headers: { 'content-type': 'image/png' } })
  }) as typeof fetch
  const records = Array.from({ length: 65 }, (_, index) => ({ ...event(`bounded-${index}.png`), sourceId: String(index) }))
  const budget = new RequestBudget()
  for (let page = 0; page < 19; page++) expect(budget.take()).toBe(true)
  const first = await storeEventImages(records, bucket, baseUrl, budget)
  expect(downloads).toBe(31)
  expect(first.filter((event) => event.imageUrl)).toHaveLength(31)
  expect(budget.take()).toBe(false)
  const secondBudget = new RequestBudget(31)
  const second = await storeEventImages(records, bucket, baseUrl, secondBudget)
  expect(downloads).toBe(62)
  expect(second.filter((event) => event.imageUrl)).toHaveLength(62)
  const third = await storeEventImages(records, bucket, baseUrl, new RequestBudget(31))
  expect(downloads).toBe(65)
  expect(third.every((event) => event.imageUrl?.startsWith(baseUrl.href))).toBe(true)
})

test('zero download budget retains old R2 images and leaves missing ones null', async () => {
  globalThis.fetch = (async (_input: string | URL | Request) => new Response(png, { headers: { 'content-type': 'image/png' } })) as typeof fetch
  const stored = await storeEventImage(event('old-budget.png'), bucket, baseUrl)
  const key = new URL(stored.imageUrl!).pathname.slice(1)
  await bucket.put(key, png, { customMetadata: { fetchedAt: '2000-01-01T00:00:00Z' } })
  globalThis.fetch = Object.assign(async () => { throw new Error('Budget exceeded') }, { preconnect: originalFetch.preconnect }) as typeof fetch
  const result = await storeEventImages([event('old-budget.png'), event('missing-budget.png')], bucket, baseUrl, new RequestBudget(0))
  expect(result.map((event) => event.imageUrl)).toEqual([stored.imageUrl, null])
})

test('uses a scarce request for a missing image before refreshing an existing image', async () => {
  globalThis.fetch = (async (_input: string | URL | Request) => new Response(png, { headers: { 'content-type': 'image/png' } })) as typeof fetch
  const stored = await storeEventImage(event('priority-old.png'), bucket, baseUrl)
  await bucket.put(new URL(stored.imageUrl!).pathname.slice(1), png, { customMetadata: { fetchedAt: '2000-01-01T00:00:00Z' } })
  const urls: string[] = []
  globalThis.fetch = (async (input: string | URL | Request) => {
    urls.push(String(input))
    return new Response(png, { headers: { 'content-type': 'image/png' } })
  }) as typeof fetch
  const result = await storeEventImages([event('priority-old.png'), event('priority-missing.png')], bucket, baseUrl, new RequestBudget(1))
  expect(urls).toEqual(['https://cdn.example.com/priority-missing.png'])
  expect(result.every((event) => event.imageUrl?.startsWith(baseUrl.href))).toBe(true)
})

test('a failed refresh keeps the stored R2 image and duplicate source URLs download once', async () => {
  globalThis.fetch = (async (_input: string | URL | Request) => new Response(png, { headers: { 'content-type': 'image/png' } })) as typeof fetch
  const stored = await storeEventImage(event('failed-refresh.png'), bucket, baseUrl)
  await bucket.put(new URL(stored.imageUrl!).pathname.slice(1), png, { customMetadata: { fetchedAt: '2000-01-01T00:00:00Z' } })
  globalThis.fetch = (async (_input: string | URL | Request) => new Response('limited', { status: 429 })) as typeof fetch
  expect((await storeEventImages([event('failed-refresh.png')], bucket, baseUrl, new RequestBudget(1)))[0]?.imageUrl).toBe(stored.imageUrl)
  let downloads = 0
  globalThis.fetch = (async (_input: string | URL | Request) => {
    downloads++
    return new Response(png, { headers: { 'content-type': 'image/png' } })
  }) as typeof fetch
  const result = await storeEventImages([event('duplicate.png'), { ...event('duplicate.png'), sourceId: '2' }], bucket, baseUrl, new RequestBudget(1))
  expect(downloads).toBe(1)
  expect(result[0]?.imageUrl).not.toBeNull()
  expect(result[1]?.imageUrl).toBe(result[0]?.imageUrl)
})
