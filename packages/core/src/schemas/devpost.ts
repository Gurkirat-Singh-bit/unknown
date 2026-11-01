import { z } from 'zod'
import { webUrlSchema } from './event'

export const devpostEventSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  url: webUrlSchema,
  open_state: z.enum(['open', 'upcoming', 'ended']),
  displayed_location: z.object({ location: z.string() }).nullish(),
  organization_name: z.string().nullish(),
  thumbnail_url: z.string().nullish(),
  submission_period_dates: z.string().nullish(),
  prize_amount: z.string().nullish(),
  themes: z.array(z.object({ name: z.string() })).default([]),
}).passthrough()

export const devpostPageSchema = z.object({
  hackathons: z.array(devpostEventSchema),
  meta: z.object({
    total_count: z.number().int().nonnegative(),
    per_page: z.number().int().positive(),
  }),
})

export type DevpostEvent = z.infer<typeof devpostEventSchema>
export type DevpostPage = z.infer<typeof devpostPageSchema>
