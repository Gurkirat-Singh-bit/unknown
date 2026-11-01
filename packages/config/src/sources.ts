export const sources = {
  devpost: {
    url: 'https://devpost.com/api/hackathons',
    statuses: ['open', 'upcoming'],
    requestTimeoutMs: 30_000,
    maxPages: 50,
    pageDelayMs: 500,
  },
} as const
