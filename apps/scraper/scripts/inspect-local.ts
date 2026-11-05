import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { localDirectory, openLocalEnvironment } from './local-env'

const local = await openLocalEnvironment()
try {
  const { DB, EVENT_IMAGES } = local.env
  console.log(`Local D1/R2 storage: ${localDirectory}`)
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
    const page = await EVENT_IMAGES.list({ cursor })
    for (const object of page.objects) {
      count++
      bytes += object.size
      sampleKey ??= object.key
    }
    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)
  console.log('Image objects:', { count, bytes })
  if (sampleKey) {
    const image = await EVENT_IMAGES.get(sampleKey)
    if (!image) throw new Error(`Stored image disappeared: ${sampleKey}`)
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif',
    }
    const path = join(localDirectory, `sample-image.${extensions[image.httpMetadata?.contentType ?? ''] ?? 'bin'}`)
    await writeFile(path, new Uint8Array(await image.arrayBuffer()))
    console.log('Exported image:', { path, key: image.key, contentType: image.httpMetadata?.contentType, ...image.customMetadata })
  }
} finally {
  await local.dispose()
}
