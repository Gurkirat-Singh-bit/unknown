import { expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createDb } from '@repo/db/client'
import { upsertEvents } from '@repo/db/queries/events'
import { openLocalEnvironment } from '../scripts/local-env'

test('local migrations, event records and image bytes survive disposing and reopening', async () => {
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
      await first.env.EVENT_IMAGES.put('events/devpost/persistent', new Uint8Array([1, 2, 3]), {
        httpMetadata: { contentType: 'image/png' }, customMetadata: { fetchedAt: '2026-11-01T12:00:00Z' },
      })
    } finally {
      await first.dispose()
    }
    const second = await openLocalEnvironment(directory)
    try {
      expect((await second.env.DB.prepare('SELECT * FROM local_migrations ORDER BY name').all()).results).toEqual(ledger)
      const rows = (await second.env.DB.prepare('SELECT id, title, created_at FROM events').all()).results
      expect(rows).toEqual([{ id: 'devpost:persistent', title: 'Persistent event', created_at: createdAt }])
      const image = await second.env.EVENT_IMAGES.get('events/devpost/persistent')
      expect(image).not.toBeNull()
      expect(new Uint8Array(await image!.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]))
      expect(image!.httpMetadata?.contentType).toBe('image/png')
      expect(image!.customMetadata?.fetchedAt).toBe('2026-11-01T12:00:00Z')
    } finally {
      await second.dispose()
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}, 30_000)
