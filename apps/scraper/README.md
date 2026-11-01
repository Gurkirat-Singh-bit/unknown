# Devpost scraper

The Worker entry is `src/index.ts`, with a scheduled handler and no HTTP routes. `src/sources/devpost.ts` collects open hackathons from Devpost's JSON listing endpoint across multiple pages. It does not write to D1 yet.

## Run locally

From the repository root:

```sh
bun install
bun run --filter '@repo/config' --filter '@repo/core' --filter scraper check-types
bun -e 'import { scrapeDevpost } from "./apps/scraper/src/sources/devpost.ts"; const events = await scrapeDevpost(); console.log(events.length);'
```

The manual command runs in Bun. Cloudflare runtime verification, deployment configuration, and the actual Cron Trigger are pending. Defining `scheduled()` alone does not create a schedule.

## Shared settings and schemas

- `packages/config/src/sources.ts` exports `sources` through `@repo/config/sources`. Devpost settings are the JSON endpoint URL, open-status filter, 30-second request timeout, 50-page safety cap, and a 500-millisecond delay between pages.
- `packages/core/src/schemas/devpost.ts` exports `devpostEventSchema`, `devpostPageSchema`, and their inferred TypeScript types through `@repo/core/schemas/devpost`.
- Zod belongs to `@repo/core`; the scraper depends on that workspace package. Other apps can declare the same dependency when they need these contracts.
- Event validation currently requires a positive integer ID, nonempty title, valid URL, and recognized open state. Extra source fields are preserved using `.passthrough()`. This is a minimal source contract, not a fully normalized frontend/database event schema.
- Page validation requires a hackathon array and pagination metadata. It rejects the entire page if an event fails the minimal schema.

## How collection works

1. The scheduled handler awaits the exported `scrapeDevpost()` function and logs the final record count. Errors propagate so the handler cannot falsely report success.
2. A loop starts at page 1 and stops at the configured page cap. Subsequent requests wait for the configured delay.
3. `new URL(...)` and `searchParams.set(...)` build requests with `status[]=open` and the current page number. URL encoding is handled automatically.
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
- Rate-limit backoff, bounded retries, field normalization, D1 persistence, deployment, and frontend queries remain pending. HTTP failures currently fail the run immediately.

## Package and compiler setup

`@repo/config` provides settings; `@repo/core` provides runtime validation and inferred types. Cloudflare Worker types and TypeScript are development dependencies. The compiler uses Worker globals, strict checks, ES2022, bundler module resolution, and no emitted output. Shared packages export TypeScript source directly for the app bundler. Cheerio has been removed.
