export const images = {
  requestTimeoutMs: 15_000,
  maxBytes: 5 * 1024 * 1024,
  refreshAfterMs: 24 * 60 * 60 * 1000,
  cacheControl: 'public, max-age=3600',
  contentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
} as const
