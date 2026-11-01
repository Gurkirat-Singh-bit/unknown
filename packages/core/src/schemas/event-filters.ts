import { z } from 'zod'
import {
  eventModeSchema, eventStatusSchema, eventTypeSchema, sourceSchema, timestampSchema,
} from './event'

const activeOnlySchema = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value) => value === 'true'),
])

export const eventFiltersSchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  source: sourceSchema.optional(),
  type: eventTypeSchema.optional(),
  mode: eventModeSchema.optional(),
  status: eventStatusSchema.optional(),
  city: z.string().trim().min(1).max(200).optional(),
  country: z.string().trim().min(1).max(200).optional(),
  startsAfter: timestampSchema.optional(),
  startsBefore: timestampSchema.optional(),
  activeOnly: activeOnlySchema.default(true),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
}).refine(
  (filters) => !filters.startsAfter || !filters.startsBefore || filters.startsBefore >= filters.startsAfter,
  { message: 'Start-date range is reversed', path: ['startsBefore'] },
)

export type EventFiltersInput = z.input<typeof eventFiltersSchema>
export type EventFilters = z.infer<typeof eventFiltersSchema>
