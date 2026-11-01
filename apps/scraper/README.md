# Devpost scraper

The Worker entry is `src/index.ts`, with a scheduled handler and no HTTP routes. `src/sources/devpost.ts` collects open and upcoming hackathons from Devpost's JSON listing endpoint across multiple pages. The scheduled handler normalizes the records and calls the shared Drizzle upsert helper using `env.DB`. A real D1 binding, applied migrations, and deployment schedule must still be configured before deploying it.

## Run locally

From the repository root:

```sh
bun install
bun run --filter '@repo/config' --filter '@repo/core' --filter scraper check-types
bun -e 'import { scrapeDevpost } from "./apps/scraper/src/sources/devpost.ts"; const events = await scrapeDevpost(); console.log(events.length);'
```

The manual command runs in Bun. Cloudflare runtime verification, deployment configuration, and the actual Cron Trigger are pending. Defining `scheduled()` alone does not create a schedule.

## Shared settings and schemas

- `packages/config/src/sources.ts` exports `sources` through `@repo/config/sources`. Devpost settings are the JSON endpoint URL, open/upcoming status filters, 30-second request timeout, 50-page safety cap, and a 500-millisecond delay between pages.
- `packages/core/src/schemas/devpost.ts` exports `devpostEventSchema`, `devpostPageSchema`, and their inferred TypeScript types through `@repo/core/schemas/devpost`.
- The normalized product event and read-filter contracts are exported from `@repo/core/schemas/event` and `@repo/core/schemas/event-filters`. Drizzle queries live in `@repo/db`; the scraper depends on all three shared packages.
- Zod belongs to `@repo/core`; the scraper depends on that workspace package. Other apps can declare the same dependency when they need these contracts.
- Event validation currently requires a positive integer ID, nonempty title, valid URL, and recognized open state. Extra source fields are preserved using `.passthrough()`. This is a minimal source contract, not a fully normalized frontend/database event schema.
- Page validation requires a hackathon array and pagination metadata. It rejects the entire page if an event fails the minimal schema.

## How collection works

1. The scheduled handler captures a run timestamp, awaits `scrapeDevpost()`, maps its records through `normalizeDevpostEvent()`, and upserts through `@repo/db`. Errors propagate so a failed run cannot falsely report success. The standalone collection command above only fetches source records; it does not write to D1.
2. A loop starts at page 1 and stops at the configured page cap. Subsequent requests wait for the configured delay.
3. `new URL(...)`, `searchParams.append(...)`, and `searchParams.set(...)` build requests with both `status[]=open` and `status[]=upcoming`, plus the current page number. URL encoding is handled automatically.
4. `fetch()` downloads JSON with an `AbortSignal` timeout. HTTP errors and non-JSON content types reject the run. There is no browser or HTML parser.
5. `devpostPageSchema.safeParse(...)` validates the response. Validation failures throw with the Zod error attached as the cause. A separate check ensures every returned event matches the requested status.
6. A `Map` keyed by the stable source ID collects events and replaces duplicates across pages.
7. A successful first page with zero reported listings returns an empty array. Otherwise collection returns only after the unique count reaches the reported total.
8. A page that makes no progress, a short page before all records are collected, or the page cap causes an error. The function does not return a silently truncated partial result.

Devpost's live results can change during collection. The count checks detect some inconsistencies but do not provide a snapshot guarantee.

## Source limitations and pending work

- The listing endpoint is used by Devpost's own website; it is not a guaranteed public API contract. Requests can be blocked. Cloudflare Worker access still needs verification.
- Submission dates are formatted strings, not precise event timestamps. Preserve their meaning when normalizing; submission periods are not necessarily event start/end times.
- Full descriptions and other detailed fields may require a separate detail source.
- Shared normalized event validation, minimal Devpost normalization, and Drizzle persistence helpers are implemented. Remote D1 setup, migration application, scheduling/deployment, rate-limit backoff, bounded retries, and frontend integration remain pending. HTTP failures currently fail the run immediately.

## Package and compiler setup

`@repo/config` provides settings; `@repo/core` provides runtime validation and inferred types; `@repo/db` provides the Drizzle client and queries. Cloudflare Worker types and TypeScript are development dependencies. The compiler uses Worker globals, strict checks, ES2022, bundler module resolution, and no emitted output. Shared packages export TypeScript source directly for the app bundler. Cheerio has been removed.

## Review

See `docs/review.md` for verified behavior and the remaining deployment, freshness, and rate-limit work. Open/upcoming are source submission states; actual event dates may remain unknown. URLs in normalized events are restricted to HTTP(S). A missing `DB` binding fails the scheduled handler before source requests begin.
