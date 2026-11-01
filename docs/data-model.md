# Shared event model and Drizzle D1 schema

The product event contract is `packages/core/src/schemas/event.ts`; the matching Drizzle table is `packages/db/src/schema.ts`. Zod handles runtime validation and defaults. Drizzle provides typed SQL, inferred row/insert types, and migration generation. There is no separate handwritten event interface.

| Fields | Meaning |
|---|---|
| `source`, `sourceId`, `sourceUrl` | Source slug, stable external ID, and original listing URL. |
| `title`, `type` | Event name and kind: hackathon, meetup, conference, or other. |
| `mode` | Online, in-person (`in_person`), hybrid, or unknown. |
| `status` | Open, upcoming, ended, or unknown. |
| `description`, `location`, `city`, `country` | Nullable event text and structured location. |
| `startsAt`, `endsAt` | Nullable actual event timestamps. Known timestamps normalize to UTC ISO 8601; end cannot precede start. |
| `submissionPeriod` | Source-provided submission-period text, separate from actual event dates. |
| `organizer`, `imageUrl`, `prizeText` | Nullable listing details. |
| `tags` | String array; stored as JSON text in SQLite. |
| `scrapedAt` | Required successful collection timestamp. |
| `id`, `createdAt`, `updatedAt` | Added by persistence: deterministic source identity, first insertion time, and latest accepted ingestion time. |

The unique key is `(source, sourceId)`, so different platforms can use the same external ID. Internal IDs use `source:sourceId`. Cross-source event merging is not implemented.

## Shared imports

```ts
import { eventSchema, type Event, type EventRecord } from '@repo/core/schemas/event'
import { eventFiltersSchema, type EventFilters } from '@repo/core/schemas/event-filters'
```

Browser code can use these contracts after declaring the core workspace dependency. Server code can use the separate `@repo/db` package; the frontend app has not been changed.

## Devpost normalization

The source contract remains `@repo/core/schemas/devpost`. Its normalizer is `apps/scraper/src/normalizers/devpost.ts`.

- Devpost's numeric ID becomes `sourceId`; event type is `hackathon`.
- Titles, source URLs, organizer, theme tags, images, and display location are mapped to the common contract.
- Protocol-relative image URLs become absolute HTTPS URLs.
- An explicit `Online` location maps to online mode. Other ambiguous locations remain unknown rather than inventing a city, country, or attendance mode.
- Prize markup is stripped into text. Do not render source text as trusted HTML.
- Formatted submission periods are retained as text. Actual event start/end dates and full descriptions stay null until a reliable detail source is added.
- One scrape timestamp is captured at run start so a slower older run cannot overwrite a newer observation in an upsert.

## Database access

`@repo/db/client` accepts a D1 binding and creates Drizzle. `@repo/db/queries/events` exports `listEvents()` and `upsertEvents()`. Both validate their input with shared Zod schemas. The migration is generated in `packages/db/migrations`; it has not been applied to a production D1 database.

Read filtering, upsert batch semantics, and migration setup are documented in `packages/db/README.md`. Stale rows that disappeared from a source or have unknown dates require a separate freshness/expiry policy; current reads only hide ended status and known expired event dates.
