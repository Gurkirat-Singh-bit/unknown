import { z } from 'zod'

export const eventTypes = ['hackathon', 'meetup', 'conference', 'other'] as const
export const eventModes = ['online', 'in_person', 'hybrid', 'unknown'] as const
export const eventStatuses = ['open', 'upcoming', 'ended', 'unknown'] as const
export const eventTypeSchema = z.enum(eventTypes)
export const eventModeSchema = z.enum(eventModes)
export const eventStatusSchema = z.enum(eventStatuses)
export const sourceSchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/)
export const webUrlSchema = z.url({ protocol: /^https?$/ })
export const timestampSchema = z.iso.datetime({ offset: true })
  .transform((value) => new Date(value).toISOString())

const optionalText = z.string().trim().min(1).nullable().default(null)

export const eventSchema = z.object({
  source: sourceSchema,
  sourceId: z.string().trim().min(1).max(200),
  sourceUrl: webUrlSchema,
  title: z.string().trim().min(1).max(500),
  type: eventTypeSchema,
  mode: eventModeSchema.default('unknown'),
  status: eventStatusSchema.default('unknown'),
  description: optionalText,
  location: optionalText,
  city: optionalText,
  country: optionalText,
  startsAt: timestampSchema.nullable().default(null),
  endsAt: timestampSchema.nullable().default(null),
  submissionPeriod: optionalText,
  organizer: optionalText,
  imageUrl: webUrlSchema.nullable().default(null),
  tags: z.array(z.string().trim().min(1)).default([]),
  prizeText: optionalText,
  scrapedAt: timestampSchema,
}).refine(
  (event) => !event.startsAt || !event.endsAt || event.endsAt >= event.startsAt,
  { message: 'Event end must be on or after its start', path: ['endsAt'] },
)

export const eventRecordSchema = eventSchema.safeExtend({
  id: z.string().min(1),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

export type EventInput = z.input<typeof eventSchema>
export type Event = z.infer<typeof eventSchema>
export type EventRecord = z.infer<typeof eventRecordSchema>
