import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { Miniflare } from 'miniflare'
import { createKvImageStorage, serveKvImage, type ImageMetadata } from '../src/storage/kv-images'
import { storeEventImage, storeEventImages } from '../src/storage/images'
import { RequestBudget } from '../src/request-budget'
import { eventSchema } from '@repo/core/schemas/event'
import worker from '../src/index'

const runtime = new Miniflare({
  modules: true, script: 'export default { fetch() { return new Response("ok") } }',
  compatibilityDate: '2026-07-30', kvNamespaces: ['EVENT_IMAGES_KV'], d1Databases: { DB: 'kv-images-tests' },
})
let kv: KVNamespace
let db: D1Database
const originalFetch = globalThis.fetch
const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
const base = new URL('https://images.local.test')
const event = (sourceId: string) => eventSchema.parse({
  source: 'devpost', sourceId, title: 'KV example', type: 'hackathon',
  sourceUrl: 'https://example.devpost.com/', imageUrl: `https://cdn.example.com/${sourceId}.png`,
  scrapedAt: '2026-11-05T02:00:00Z',
})
beforeAll(async () => {
  kv = await runtime.getKVNamespace('EVENT_IMAGES_KV') as unknown as KVNamespace
  db = await runtime.getD1Database('DB')
  const migration = await readFile(new URL('../../../packages/db/migrations/0000_events.sql', import.meta.url), 'utf8')
  for (const sql of migration.split('--> statement-breakpoint')) if (sql.trim()) await db.prepare(sql).run()
})
afterEach(() => { globalThis.fetch = originalFetch })
afterAll(async () => { await runtime.dispose() })

test('KV stores bytes and metadata, reuses recent images across runs, and serves GET/HEAD', async () => {
  let downloads = 0
  globalThis.fetch = (async (_input: string | URL | Request) => { downloads++; return new Response(bytes, { headers: { 'content-type': 'image/png' } }) }) as typeof fetch
  const stored = await storeEventImage(event('cached'), await createKvImageStorage(kv), base)
  await storeEventImage(event('cached'), await createKvImageStorage(kv), base)
  expect(downloads).toBe(1)
  const key = new URL(stored.imageUrl!).pathname.slice(1)
  const object = await kv.getWithMetadata<ImageMetadata>(key, 'arrayBuffer')
  expect(new Uint8Array(object.value!)).toEqual(bytes)
  expect(object.metadata?.sourceUrl).toBe(event('cached').imageUrl!)
  const response = await serveKvImage(new Request(stored.imageUrl!), kv)
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toBe('image/png')
  expect(response.headers.get('cache-control')).toBe('public, max-age=3600')
  expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
  const head = await serveKvImage(new Request(stored.imageUrl!, { method: 'HEAD' }), kv)
  expect(head.status).toBe(200)
  expect(head.headers.get('content-length')).toBe(String(bytes.length))
  expect(await head.text()).toBe('')
  const post = await serveKvImage(new Request(stored.imageUrl!, { method: 'POST' }), kv)
  expect(post.status).toBe(405)
})

test('image routes never fetch arbitrary URLs or expose other KV keys', async () => {
  globalThis.fetch = Object.assign(async () => { throw new Error('Unexpected external request') }, { preconnect: originalFetch.preconnect }) as typeof fetch
  await kv.put('private-key', 'private data')
  for (const path of ['/private-key', '/https://cdn.example.com/image.png', `/events/devpost/${'0'.repeat(64)}`]) {
    expect((await serveKvImage(new Request(new URL(path, base).href), kv)).status).toBe(404)
  }
  const key = `events/devpost/${'f'.repeat(64)}`
  await kv.put(key, '<svg/>', { metadata: { contentType: 'image/svg+xml' } })
  expect((await serveKvImage(new Request(new URL(key, base).href), kv)).status).toBe(502)
})

test('KV metadata scans follow cursors even when a page is empty', async () => {
  const key = `events/devpost/${'a'.repeat(64)}`
  const cursors: (string | undefined)[] = []
  const namespace = { async list(options: { cursor?: string }) {
    cursors.push(options.cursor)
    return options.cursor ? { keys: [{ name: key, metadata: { fetchedAt: 'recent' } }], list_complete: true }
      : { keys: [], list_complete: false, cursor: 'next' }
  } } as unknown as KVNamespace
  const storage = await createKvImageStorage(namespace)
  expect((await storage.head(key))?.customMetadata?.fetchedAt).toBe('recent')
  expect(cursors).toEqual([undefined, 'next'])
})

test('KV image batches resume across invocations and retain cached objects on a failed refresh', async () => {
  let downloads = 0
  globalThis.fetch = (async (_input: string | URL | Request) => { downloads++; return new Response(bytes, { headers: { 'content-type': 'image/png' } }) }) as typeof fetch
  const events = Array.from({ length: 6 }, (_, i) => event(`batch-${i}`))
  const first = await storeEventImages(events, await createKvImageStorage(kv), base, new RequestBudget(3))
  expect(first.filter((row) => row.imageUrl)).toHaveLength(3)
  const second = await storeEventImages(events, await createKvImageStorage(kv), base, new RequestBudget(3))
  expect(second.filter((row) => row.imageUrl)).toHaveLength(6)
  expect(downloads).toBe(6)
  const key = new URL(second[0]!.imageUrl!).pathname.slice(1)
  const object = await kv.getWithMetadata<ImageMetadata>(key, 'arrayBuffer')
  await kv.put(key, object.value!, { metadata: { ...object.metadata, fetchedAt: '2000-01-01T00:00:00Z' } })
  globalThis.fetch = (async (_input: string | URL | Request) => new Response('limited', { status: 429 })) as typeof fetch
  const refreshed = await storeEventImages([events[0]!], await createKvImageStorage(kv), base, new RequestBudget(1))
  expect(refreshed[0]?.imageUrl).toBe(second[0]!.imageUrl)
  expect(new Uint8Array((await kv.get(key, 'arrayBuffer'))!)).toEqual(bytes)
})

test('scheduled KV ingestion persists a served image URL in D1 without R2', async () => {
  const listing = { id: 123, title: 'KV integration', url: 'https://example.devpost.com/', open_state: 'open', thumbnail_url: '//cdn.example.com/integration.png' }
  globalThis.fetch = (async (input) => new URL(String(input)).hostname === 'devpost.com'
    ? Response.json({ hackathons: [listing], meta: { total_count: 1, per_page: 9 } })
    : new Response(bytes, { headers: { 'content-type': 'image/png' } })) as typeof fetch
  const env = { DB: db, EVENT_IMAGES_KV: kv, IMAGE_PUBLIC_BASE_URL: base.href }
  await worker.scheduled({} as ScheduledController, env)
  const row = await db.prepare('SELECT image_url FROM events WHERE id = ?').bind('devpost:123').first<{ image_url: string }>()
  const response = await worker.fetch(new Request(row!.image_url), env)
  expect(response.status).toBe(200)
  expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
})
