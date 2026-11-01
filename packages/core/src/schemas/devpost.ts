import { z } from 'zod'

export const devpostEventSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  url: z.string().url(),
  open_state: z.enum(['open', 'upcoming', 'ended']),
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
