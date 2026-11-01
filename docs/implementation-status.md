# Implementation Status

Snapshot from the repository and project notes dated 2026-11-01.

## Implemented

- Bun workspaces and Turborepo monorepo.
- `apps/web` contains a Next.js app with a placeholder event-finder page.
- `apps/scraper` contains a plain Worker entry with a `scheduled()` handler and no HTTP routes.
- Its separately exported `scrapeDevpost()` function collects open and upcoming listings from Devpost's paginated JSON endpoint, deduplicates source IDs, and rejects incomplete collection.
- Shared source settings live in `@repo/config/sources`; minimal Zod event/page schemas and inferred types live in `@repo/core/schemas/devpost`. Cheerio has been removed.
- The latest live local collection and normalization returned 166 unique records from the API: 44 open and 122 upcoming. Type checks and focused pagination/failure checks passed. Cloudflare runtime verification is pending.

- Shared normalized event/record schema and bounded read-filter schema are implemented in core.
- `@repo/db` contains the Drizzle D1 client, events table, generated initial migration, and validated read/upsert helpers.
- The scraper normalizes source records and calls D1 upserts through a required `DB` binding. No real binding or production migration has been configured/applied yet.
- R2 thumbnail copying is implemented before D1 writes with a shared 50-external-request budget. Deferred/failed new images stay null while event updates continue; later runs prioritize missing thumbnails. Source-URL-hash keys reuse images for 24 hours; bounded HTTPS downloads refresh older objects. The stored imageUrl points at the configured public R2 domain. Real R2 setup is pending; the example Wrangler config is not active.
- Frontend application files remain untouched; its server can adopt shared queries in a later integration step.
- Shared package/scraper type checks pass. Six isolated Miniflare D1 integration tests and nine collection/normalization tests pass. They cover upserts, validation, filters, timestamps, batching, open/upcoming pagination, duplicate records, malformed/blocked responses, normalization, and URL schemes. Production code and test code are type-checked. The generated migration matches the table schema.
- Twelve additional isolated R2/D1 tests cover image bytes/metadata, cache reuse/refresh, response/size validation, and scheduled ingestion, shared request budgeting, progress across runs, and non-blocking image failures. A real 37,180-byte Devpost PNG was also copied to local R2 and its URL persisted in local D1; production serving remains unverified.

## Planned, not implemented

- Richer event details and stale-listing expiry policy
- Six-hour Cloudflare scheduled trigger
- Real D1 binding and application of the generated migration
- Production verification of D1 writes and stale-listing handling
- Next.js server-side D1 reads and event filters
- Real R2 bucket binding and public image domain
- Scrape run logging and error reporting

## Suggested next steps

1. Confirm the initial event fields with the frontend owner using [data-model.md](data-model.md).
2. Configure a real D1 binding and apply the generated migration locally before deployment.
3. Confirm shared event fields with the frontend owner and identify any detail fields requiring another source.
4. Verify the configured scheduled handler against the local D1 database.
5. Configure the six-hour scheduled Worker trigger.
6. Connect Next.js server-side queries to D1 and render actual listings.
7. Decide on event expiry, R2 object retention, and cross-source deduplication.
