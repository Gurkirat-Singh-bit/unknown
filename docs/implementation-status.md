# Implementation Status

Snapshot from the repository and project notes dated 2026-11-01.

## Implemented

- Bun workspaces and Turborepo monorepo.
- `apps/web` contains a Next.js app with a placeholder event-finder page.
- `apps/scraper` contains a plain Worker entry with a `scheduled()` handler and no HTTP routes.
- Its separately exported `scrapeDevpost()` function collects open listings from Devpost's paginated JSON endpoint, deduplicates source IDs, and rejects incomplete collection.
- Shared source settings live in `@repo/config/sources`; minimal Zod event/page schemas and inferred types live in `@repo/core/schemas/devpost`. Cheerio has been removed.
- A direct local Bun invocation collected 44 unique open records from the live API. Type checks and focused pagination/failure checks passed. Cloudflare runtime verification is pending.

## Planned, not implemented

- Full event-field normalization/validation beyond the minimal source schema
- Six-hour Cloudflare scheduled trigger
- D1 binding, schema, and migrations
- Record normalization, validation, and deduplication
- D1 upserts and expired-event handling
- Next.js server-side D1 reads and event filters
- R2 image storage
- Scrape run logging and error reporting

## Suggested next steps

1. Confirm the initial event fields with the frontend owner using [data-model.md](data-model.md).
2. Add D1 binding and migration.
3. Map Devpost JSON fields to the agreed database/frontend event schema, preserving submission-date meaning.
4. Add idempotent upserts and scrape timestamps.
5. Configure the six-hour scheduled Worker trigger.
6. Connect Next.js server-side queries to D1 and render actual listings.
7. Decide on event expiry, R2 image handling, and cross-source deduplication.
