import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ImageMetadata } from '../src/storage/kv-images'
import { localDirectory, openLocalEnvironment } from './local-env'

const local = await openLocalEnvironment()
try {
  const { DB, EVENT_IMAGES_KV } = local.env
  console.log(`Local D1/KV storage: ${localDirectory}`)
  console.log('Events:', await DB.prepare(`SELECT COUNT(*) AS total,
    COUNT(image_url) AS with_images FROM events`).first())
  console.log('Status counts:', (await DB.prepare('SELECT status, COUNT(*) AS count FROM events GROUP BY status').all()).results)
  console.log('Sample records:', (await DB.prepare(`SELECT id, source, source_id, title, status,
    image_url, created_at, updated_at, scraped_at FROM events ORDER BY id LIMIT 5`).all()).results)
  let cursor: string | undefined
  let count = 0
  let bytes = 0
  let sampleKey: string | undefined
  do {
    const page = await EVENT_IMAGES_KV.list<ImageMetadata>({ prefix: 'events/', cursor })
    for (const object of page.keys) {
      count++
      bytes += object.metadata?.size ?? 0
      sampleKey ??= object.name
    }
    cursor = page.list_complete ? undefined : page.cursor
  } while (cursor)
  console.log('Image objects:', { count, bytes })
  if (sampleKey) {
    const image = await EVENT_IMAGES_KV.getWithMetadata<ImageMetadata>(sampleKey, 'arrayBuffer')
    if (!image.value) throw new Error(`Stored image disappeared: ${sampleKey}`)
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif',
    }
    const path = join(localDirectory, `sample-image.${extensions[image.metadata?.contentType ?? ''] ?? 'bin'}`)
    await writeFile(path, new Uint8Array(image.value))
    console.log('Exported image:', { path, key: sampleKey, contentType: image.metadata?.contentType, ...image.metadata })
  }
} finally {
  await local.dispose()
}
