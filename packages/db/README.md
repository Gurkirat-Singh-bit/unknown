# Shared event database

`@repo/db` provides the Drizzle SQLite schema, D1 client factory, migrations, and server-side event queries. It has no credentials or runtime-global binding imports. Each Worker supplies its own D1 binding.

```ts
import { createDb } from '@repo/db/client'
import { listEvents, upsertEvents } from '@repo/db/queries/events'

const db = createDb(env.DB)
const events = await listEvents(db, { mode: 'online', limit: 20 })
await upsertEvents(db, normalizedEvents)
```

Use this package in server code. Browser components can use types and Zod validators from `@repo/core/schemas/event` and `@repo/core/schemas/event-filters`. No frontend code has been integrated in this change.

## Contracts

- The normalized event schema and enums live in `@repo/core/schemas/event`. Source response schemas are separate from this product contract.
- Drizzle tables reuse those enums. `EventRow` and `EventInsert` are inferred from the table; query results match the shared `EventRecord` contract.
- `createDb(binding)` returns a D1-backed Drizzle client. Both apps must be configured separately to bind to the intended database.
- `upsertEvents()` validates every input before any write. Identity is `(source, sourceId)`, with deterministic IDs such as `devpost:31302`. Repeated writes preserve the initial `createdAt`; `updatedAt` records successful ingestion time. Older scrape observations do not overwrite newer ones.
- Upserts run in D1 batches of up to 50 statements. Each batch is atomic; the complete multi-batch call is not. A later failure may leave earlier batches committed. Repeating the operation is safe by source identity. Its return value counts validated inputs processed, not rows changed.
- `listEvents()` validates filters, defaults to 20 records, caps results at 100, and supports offset pagination. It returns an array, not a total-count response.
- Title search is literal, case-insensitive substring matching. Source, type, mode, status, city, and country are exact filters. SQLite's built-in case folding is primarily ASCII.
- Active listings exclude `ended` status and known past end dates. Unknown event dates remain eligible. To query ended listings, set `activeOnly: false`.
- Start-date filters select actual `startsAt` values; records with unknown starts are excluded from a supplied start-date range. Results sort by known start date, then ID, with unknown starts last.

## Migrations

From the repository root:

```sh
bun run --filter @repo/db db:generate
bun run --filter @repo/db check-types
bun run --filter @repo/db test
```

The initial generated migration is `migrations/0000_events.sql`, with Drizzle metadata alongside it. Change `src/schema.ts`, then generate the next migration; commit both SQL and metadata. This package is the single owner of migrations for both apps.

No remote database is created and no migration is applied by generation. When the scraper's Worker configuration is added, set its D1 binding name to `DB` and `migrations_dir` to `../../packages/db/migrations` (relative to a configuration file in `apps/scraper`). Apply migrations through Wrangler using that Worker configuration, first locally, then remotely when deploying. The web Worker will need its own binding to the same production database; configuring it is pending.

Tests use an isolated in-memory Miniflare D1 instance and apply the generated migration. They do not access production data.
