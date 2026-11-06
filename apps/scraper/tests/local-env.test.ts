import { expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createDb } from '@repo/db/client'
import { upsertEvents } from '@repo/db/queries/events'
import { openLocalEnvironment } from '../scripts/local-env'

test('local migrations, event records and KV image bytes survive disposing and reopening', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'scraper-local-'))
  try {
    const first = await openLocalEnvironment(directory)
    let ledger: Record<string, unknown>[] = []
    let createdAt: unknown
    try {
      ledger = (await first.env.DB.prepare('SELECT * FROM local_migrations ORDER BY name').all()).results
      expect(ledger.length).toBeGreaterThan(0)
      await upsertEvents(createDb(first.env.DB), [{
        source: 'devpost', sourceId: 'persistent', sourceUrl: 'https://example.devpost.com/',
        title: 'Persistent event', type: 'hackathon', scrapedAt: '2026-11-01T12:00:00Z',
      }])
      createdAt = await first.env.DB.prepare('SELECT created_at FROM events').first('created_at')
      await first.env.EVENT_IMAGES_KV.put('events/devpost/persistent', new Uint8Array([1, 2, 3]), {
        metadata: { contentType: 'image/png', fetchedAt: '2026-11-01T12:00:00Z' },
      })
    } finally {
      await first.dispose()
    }
    const second = await openLocalEnvironment(directory)
    try {
      expect((await second.env.DB.prepare('SELECT * FROM local_migrations ORDER BY name').all()).results).toEqual(ledger)
      const rows = (await second.env.DB.prepare('SELECT id, title, created_at FROM events').all()).results
      expect(rows).toEqual([{ id: 'devpost:persistent', title: 'Persistent event', created_at: createdAt }])
      const image = await second.env.EVENT_IMAGES_KV.getWithMetadata<{ contentType: string; fetchedAt: string }>('events/devpost/persistent', 'arrayBuffer')
      expect(image.value).not.toBeNull()
      expect(new Uint8Array(image.value!)).toEqual(new Uint8Array([1, 2, 3]))
      expect(image.metadata?.contentType).toBe('image/png')
      expect(image.metadata?.fetchedAt).toBe('2026-11-01T12:00:00Z')
    } finally {
      await second.dispose()
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}, 30_000)

test('imports legacy local R2 images into KV without overwriting an existing KV image', async () => {
  const { Miniflare } = await import('miniflare')
  const directory = await mkdtemp(join(tmpdir(), 'scraper-import-'))
  const key = `events/devpost/${'a'.repeat(64)}`
  try {
    const legacy = new Miniflare({
      modules: true, script: 'export default { fetch() { return new Response("ok") } }',
      compatibilityDate: '2026-07-30', r2Buckets: { EVENT_IMAGES: 'scraper-local-images' },
      r2Persist: join(directory, 'r2'),
    })
    try {
      const bucket = await legacy.getR2Bucket('EVENT_IMAGES')
      await bucket.put(key, new Uint8Array([1, 2, 3]), {
        httpMetadata: { contentType: 'image/png' }, customMetadata: { fetchedAt: '2026-11-01T12:00:00Z' },
      })
    } finally { await legacy.dispose() }
    const imported = await openLocalEnvironment(directory)
    try {
      const image = await imported.env.EVENT_IMAGES_KV.getWithMetadata<{ contentType: string; size: number }>(key, 'arrayBuffer')
      expect(new Uint8Array(image.value!)).toEqual(new Uint8Array([1, 2, 3]))
      expect(image.metadata).toMatchObject({ contentType: 'image/png', size: 3, fetchedAt: '2026-11-01T12:00:00Z' })
      await imported.env.EVENT_IMAGES_KV.put(key, new Uint8Array([4, 5, 6]))
    } finally { await imported.dispose() }
    const reopened = await openLocalEnvironment(directory)
    try {
      expect(new Uint8Array((await reopened.env.EVENT_IMAGES_KV.get(key, 'arrayBuffer'))!)).toEqual(new Uint8Array([4, 5, 6]))
    } finally { await reopened.dispose() }
  } finally { await rm(directory, { recursive: true, force: true }) }
}, 30_000)
