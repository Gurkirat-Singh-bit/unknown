import { mkdir, readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { Miniflare } from 'miniflare'
import type { ImageMetadata } from '../src/storage/kv-images'

export const localDirectory = fileURLToPath(new URL('../.local/', import.meta.url))
const migrationDirectory = fileURLToPath(new URL('../../../packages/db/migrations/', import.meta.url))

async function migrate(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS local_migrations (
    name TEXT PRIMARY KEY, applied_at TEXT NOT NULL
  )`).run()
  const files = (await readdir(migrationDirectory)).filter((name) => name.endsWith('.sql')).sort()
  for (const name of files) {
    if (await db.prepare('SELECT name FROM local_migrations WHERE name = ?').bind(name).first()) continue
    const sql = await readFile(join(migrationDirectory, name), 'utf8')
    const statements = sql.split('--> statement-breakpoint').filter((statement) => statement.trim())
      .map((statement) => db.prepare(statement))
    // D1 batches are transactional: a failed migration must not enter the ledger.
    await db.batch([...statements, db.prepare('INSERT INTO local_migrations (name, applied_at) VALUES (?, ?)')
      .bind(name, new Date().toISOString())])
  }
}

export async function openLocalEnvironment(directory = localDirectory) {
  await mkdir(directory, { recursive: true })
  const runtime = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response("Local storage only") } }',
    compatibilityDate: '2026-07-30',
    d1Databases: { DB: 'scraper-local-events' },
    d1Persist: join(directory, 'd1'),
    kvNamespaces: { EVENT_IMAGES_KV: 'scraper-local-images' },
    kvPersist: join(directory, 'kv'),
    // Keep old local R2 storage readable so existing downloaded images can migrate.
    r2Buckets: { EVENT_IMAGES: 'scraper-local-images' },
    r2Persist: join(directory, 'r2'),
  })
  try {
    const DB = await runtime.getD1Database('DB')
    const EVENT_IMAGES = await runtime.getR2Bucket('EVENT_IMAGES') as unknown as R2Bucket
    const EVENT_IMAGES_KV = await runtime.getKVNamespace('EVENT_IMAGES_KV') as unknown as KVNamespace
    await migrate(DB)
    // Import missing legacy objects locally; production never needs an R2 binding.
    const known = new Set<string>()
    let cursor: string | undefined
    do {
      const page = await EVENT_IMAGES_KV.list({ prefix: 'events/', cursor })
      page.keys.forEach((key) => known.add(key.name))
      cursor = page.list_complete ? undefined : page.cursor
    } while (cursor)
    do {
      const page = await EVENT_IMAGES.list({ prefix: 'events/', cursor })
      for (const object of page.objects) {
        if (known.has(object.key)) continue
        const image = await EVENT_IMAGES.get(object.key)
        if (!image) continue
        const metadata: ImageMetadata = {
          contentType: image.httpMetadata?.contentType ?? '',
          fetchedAt: image.customMetadata?.fetchedAt ?? '',
          sourceUrl: image.customMetadata?.sourceUrl ?? '',
          size: image.size,
        }
        await EVENT_IMAGES_KV.put(image.key, await image.arrayBuffer(), { metadata })
      }
      cursor = page.truncated ? page.cursor : undefined
    } while (cursor)
    return {
      env: { DB, EVENT_IMAGES_KV, IMAGE_PUBLIC_BASE_URL: 'https://images.local.test' },
      dispose: () => runtime.dispose(),
    }
  } catch (error) {
    await runtime.dispose()
    throw error
  }
}
