import { images } from '@repo/config/images'
import type { ImageStorage } from './images'

export interface ImageMetadata {
  contentType: string
  sourceUrl: string
  fetchedAt: string
  size: number
}

// One paginated metadata scan per ingestion avoids a list request for every image
// and avoids reading image bodies just to check their refresh timestamps.
export async function createKvImageStorage(namespace: KVNamespace): Promise<ImageStorage> {
  const stored = new Map<string, ImageMetadata | undefined>()
  let cursor: string | undefined
  do {
    const page = await namespace.list<ImageMetadata>({ prefix: 'events/', cursor })
    for (const key of page.keys) stored.set(key.name, key.metadata)
    cursor = page.list_complete ? undefined : page.cursor
  } while (cursor)
  return {
    async head(key) {
      if (!stored.has(key)) return null
      const metadata = stored.get(key)
      return { customMetadata: {
        fetchedAt: metadata?.fetchedAt ?? '', sourceUrl: metadata?.sourceUrl ?? '',
      } }
    },
    async put(key, bytes, options) {
      const metadata: ImageMetadata = {
        contentType: options.httpMetadata.contentType,
        sourceUrl: options.customMetadata.sourceUrl!,
        fetchedAt: options.customMetadata.fetchedAt!,
        size: bytes.byteLength,
      }
      await namespace.put(key, bytes, { metadata })
      stored.set(key, metadata)
    },
  }
}

export async function serveKvImage(request: Request, namespace: KVNamespace): Promise<Response> {
  const key = new URL(request.url).pathname.slice(1)
  if (!/^events\/[a-z0-9_-]+\/[a-f0-9]{64}$/.test(key)) return new Response('Not found', { status: 404 })
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }
  const image = await namespace.getWithMetadata<ImageMetadata>(key, 'arrayBuffer')
  if (!image.value) return new Response('Not found', { status: 404 })
  const metadata = image.metadata
  if (!metadata || !images.contentTypes.some((type) => type === metadata.contentType)) {
    return new Response('Invalid image metadata', { status: 502 })
  }
  const headers = new Headers({
    'Content-Type': metadata.contentType,
    'Cache-Control': images.cacheControl,
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': '*',
  })
  if (Number.isSafeInteger(metadata.size) && metadata.size > 0) headers.set('Content-Length', String(metadata.size))
  if (request.method === 'HEAD') {
    return new Response(null, { headers })
  }
  return new Response(image.value, { headers })
}
