import { sql } from 'drizzle-orm'
import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import {
  eventModes, eventStatuses, eventTypes,
} from '@repo/core/schemas/event'

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  sourceId: text('source_id').notNull(),
  sourceUrl: text('source_url').notNull(),
  title: text('title').notNull(),
  type: text('type', { enum: eventTypes }).notNull(),
  mode: text('mode', { enum: eventModes }).notNull(),
  status: text('status', { enum: eventStatuses }).notNull(),
  description: text('description'),
  location: text('location'),
  city: text('city'),
  country: text('country'),
  startsAt: text('starts_at'),
  endsAt: text('ends_at'),
  submissionPeriod: text('submission_period'),
  organizer: text('organizer'),
  imageUrl: text('image_url'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  prizeText: text('prize_text'),
  scrapedAt: text('scraped_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  uniqueIndex('events_source_identity_idx').on(table.source, table.sourceId),
  index('events_starts_at_idx').on(table.startsAt),
  index('events_status_mode_idx').on(table.status, table.mode),
])

export type EventRow = typeof events.$inferSelect
export type EventInsert = typeof events.$inferInsert
