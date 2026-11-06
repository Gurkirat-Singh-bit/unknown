import { images } from '@repo/config/images'
import type { Event } from '@repo/core/schemas/event'
import { RequestBudget } from '../request-budget'

// The download/cache pipeline works with both local R2 and production KV.
export interface ImageStorage {
  head(key: string): Promise<{ customMetadata?: Record<string, string> } | null>
  put(key: string, bytes: Uint8Array, options: {
    httpMetadata: { contentType: string; cacheControl: string }
    customMetadata: Record<string, string>
  }): Promise<unknown>
}

export function parseImageBaseUrl(value: string): URL {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('IMAGE_PUBLIC_BASE_URL must be an HTTPS URL without credentials, query or fragment')
  }
  if (url.pathname !== '/') {
    throw new Error('IMAGE_PUBLIC_BASE_URL must use the bucket domain root without a path prefix')
  }
  return url
}

async function readImage(response: Response): Promise<Uint8Array> {
  const declaredSize = Number(response.headers.get('content-length'))
  if (declaredSize > images.maxBytes) {
    await response.body?.cancel()
    throw new Error('Image exceeds the size limit')
  }
  if (!response.body) throw new Error('Image response has no body')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > images.maxBytes) throw new Error('Image exceeds the size limit')
      chunks.push(value)
    }
  } catch (error) {
    await reader.cancel().catch(() => {})
    throw error
  } finally {
    reader.releaseLock()
  }
  if (size === 0) throw new Error('Image response is empty')
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

async function prepareImage(event: Event, bucket: ImageStorage, publicBaseUrl: URL) {
  if (!event.imageUrl) return null
  const sourceUrl = new URL(event.imageUrl)
  if (sourceUrl.protocol !== 'https:') throw new Error('Source images must use HTTPS')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sourceUrl.href))
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const key = `events/${event.source}/${hash}`
  const existing = await bucket.head(key)
  const fetchedAt = Date.parse(existing?.customMetadata?.fetchedAt ?? '')
  const age = Date.now() - fetchedAt
  return {
    sourceUrl, key, existing, fetchedAt,
    needsDownload: !existing || !Number.isFinite(age) || age < 0 || age >= images.refreshAfterMs,
    publicUrl: new URL(key, publicBaseUrl).href,
  }
}

async function uploadImage(plan: NonNullable<Awaited<ReturnType<typeof prepareImage>>>, bucket: ImageStorage) {
  const { sourceUrl, key } = plan
  const response = await fetch(sourceUrl, {
    signal: AbortSignal.timeout(images.requestTimeoutMs),
    redirect: 'manual',
  })
  if (!response.ok) {
    await response.body?.cancel()
    throw new Error(`Image download failed: HTTP ${response.status}`)
  }
  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()
  if (!contentType || !images.contentTypes.some((type) => type === contentType)) {
    await response.body?.cancel()
    throw new Error('Image response has an unsupported content type')
  }
  const bytes = await readImage(response)
  await bucket.put(key, bytes, {
    httpMetadata: { contentType, cacheControl: images.cacheControl },
    customMetadata: { sourceUrl: sourceUrl.href, fetchedAt: new Date().toISOString() },
  })
}

export async function storeEventImage(event: Event, bucket: ImageStorage, publicBaseUrl: URL): Promise<Event> {
  const plan = await prepareImage(event, bucket, publicBaseUrl)
  if (!plan) return event
  if (plan.needsDownload) await uploadImage(plan, bucket)
  return { ...event, imageUrl: plan.publicUrl }
}

export async function storeEventImages(events: Event[], bucket: ImageStorage, publicBaseUrl: URL, budget: RequestBudget): Promise<Event[]> {
  const result: Event[] = events.map((event) => ({ ...event, imageUrl: null }))
  const pending = []
  const plans = new Map<string, NonNullable<Awaited<ReturnType<typeof prepareImage>>>>()
  for (const [index, event] of events.entries()) {
    try {
      const identity = `${event.source}:${event.imageUrl}`
      const plan = plans.get(identity) ?? await prepareImage(event, bucket, publicBaseUrl)
      if (!plan) continue
      plans.set(identity, plan)
      if (plan.existing) result[index]!.imageUrl = plan.publicUrl
      if (plan.needsDownload) pending.push({ index, event, plan })
    } catch (cause) {
      console.warn(`Could not inspect image for ${event.source}:${event.sourceId}`, cause)
    }
  }
  pending.sort((a, b) => Number(!!a.plan.existing) - Number(!!b.plan.existing)
    || (a.plan.fetchedAt || 0) - (b.plan.fetchedAt || 0))
  const missingCount = pending.filter(({ plan }) => !plan.existing).length
  if (missingCount > 1) {
    const offset = Math.floor(Date.now() / (6 * 60 * 60 * 1000)) % missingCount
    const rotated = pending.splice(0, offset)
    pending.splice(missingCount - offset, 0, ...rotated)
  }
  const attempted = new Set<string>()
  const uploaded = new Set<string>()
  for (const { index, event, plan } of pending) {
    if (!attempted.has(plan.key)) {
      if (!budget.take()) continue
      attempted.add(plan.key)
      try {
        await uploadImage(plan, bucket)
        uploaded.add(plan.key)
      } catch (cause) {
        console.warn(`Could not download image for ${event.source}:${event.sourceId}`, cause)
      }
    }
    if (uploaded.has(plan.key)) result[index]!.imageUrl = plan.publicUrl
  }
  return result
}
