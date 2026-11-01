# Devpost scraper

The Worker entry is `src/index.ts`, with a scheduled handler and no HTTP routes. `src/sources/devpost.ts` collects open and upcoming hackathons from Devpost's JSON listing endpoint across multiple pages. The scheduled handler normalizes the records, copies thumbnails to R2, and calls the shared Drizzle upsert helper using `env.DB`. Real D1/R2 bindings, a public image domain, applied migrations, and deployment schedule must still be configured before deploying it.

## Image storage

`src/storage/images.ts` downloads normalized HTTPS image URLs into the `EVENT_IMAGES` R2 binding. D1's existing `imageUrl` field receives the public R2 URL, so no database migration or frontend code change is needed. Missing, failed, or deferred images remain null until a later successful download. Event updates continue even when thumbnails are unavailable. The exported normalizer still returns the source URL; the storage step replaces it before persistence.

- `@repo/config/images` owns the 15-second download timeout, 5 MiB size limit, 24-hour refresh interval, supported raster MIME types, and one-hour public cache lifetime.
- Keys are `events/<source>/<SHA-256 of source image URL>`. Stable source URLs reuse objects; changed URLs produce different keys. Every run checks R2 metadata; objects younger than 24 hours need no external image download. Old objects are refreshed under the same key, so CDN/browser caches can retain their previous bytes for up to the configured cache lifetime.
- Downloads run sequentially to bound concurrent connections and memory. Declared and streamed byte counts are limited. Responses must declare JPEG, PNG, WebP, GIF or AVIF; SVG, HTML, redirects, empty bodies, and failed HTTP responses are rejected. This is MIME validation, not image decoding or transcoding.
- Event collection and validation must complete before D1 writes. Image preparation runs before persistence, but individual image failures are logged and do not block event updates. An existing R2 object remains usable after a failed/deferred refresh; a new or changed source URL without a stored object stays null. Source-hosted URLs are never substituted. Unreferenced objects are not automatically deleted; retention/garbage collection is pending. D1 still commits batches independently once writes start.
- `src/request-budget.ts` shares a budget of 50 external requests between Devpost pages and image downloads. Redirects are rejected so they cannot silently consume extra requests. Listing collection takes priority and still rejects incomplete results. Remaining requests download thumbnails; the rest are deferred to subsequent scheduled runs. R2 binding calls and D1 calls have separate platform limits and do not consume this external-request budget.
- Missing objects are prioritized over refreshes; stale objects refresh oldest first. Missing-image order rotates by six-hour time slot so persistent failures are less likely to monopolize the budget. Duplicate image URLs within a source share a download. At 19 listing pages, up to 31 distinct images can download per run; 166 initially uncached images need at least six successful runs if the catalogue remains stable. Existing images remain visible while waiting for refresh.
- This bounds external requests, not total CPU or every account quota. Free Cron invocations have a 10 ms CPU allowance; deployed CPU usage, internal calls, and source access still require verification. If CPU is exceeded, processing must be split further. No paid plan is required by configuration. See [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
- Use R2 Standard storage to receive its included monthly allowance (10 GB-month, 1 million Class A and 10 million Class B operations). For illustration, 166 objects at the 5 MiB cap total about 0.87 GB; retained older objects and frontend reads add usage. R2 is usage-billed beyond its free allowance, rather than a guaranteed zero-charge storage cap. Account-wide usage must stay within that allowance. See [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

## R2 deployment setup

`wrangler.example.jsonc` is a template, not an active deployment configuration. Copy it to `wrangler.jsonc`, replace the D1 database ID and public image domain, and confirm the account/resources before deploying. Its six-hour schedule invokes `scheduled()` at 00:00, 06:00, 12:00 and 18:00 UTC after deployment.

Required bindings/settings:

| Name | Value |
| --- | --- |
| `DB` | D1 event database, with `packages/db/migrations` applied |
| `EVENT_IMAGES` | Dedicated R2 bucket, suggested name `unknown-event-images` |
| `IMAGE_PUBLIC_BASE_URL` | Public HTTPS root for that bucket, e.g. `https://images.your-domain.com`. Path prefixes such as `/assets/` are rejected so public URL paths match the uploaded object keys. |

Use a dedicated image bucket, separate from the existing Vinext response-store cache. Connect a public custom domain to the image bucket for production. A bucket binding alone does not make objects public; the S3 API URL is not the public image URL. An enabled `r2.dev` URL is suitable for testing and is rate-limited. No scraper HTTP endpoint is required to serve images. See [public R2 buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/) and [Worker bindings](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/).

Example resource commands after installing/pinning Wrangler in the scraper package and authenticating the intended account:

```sh
wrangler r2 bucket create unknown-event-images
wrangler d1 migrations apply DB --remote --config wrangler.jsonc
wrangler deploy --config wrangler.jsonc
```

Run these from `apps/scraper`. Database creation, domain connection, active config, and remote deployment have not been performed by this change. The existing Bun collection command below still fetches only source JSON and does not require R2.

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

1. The scheduled handler validates its DB/R2/public URL settings, captures a run timestamp, awaits `scrapeDevpost()`, maps its records through `normalizeDevpostEvent()`, stores images in R2, and upserts through `@repo/db`. Collection/validation and D1 write errors propagate. Image failures are logged separately and leave pending thumbnails without rejecting otherwise valid event updates. The standalone collection command above only fetches source records; it does not write to D1 or R2.
2. A loop starts at page 1 and stops at the configured page cap. Subsequent requests wait for the configured delay.
3. `new URL(...)`, `searchParams.append(...)`, and `searchParams.set(...)` build requests with both `status[]=open` and `status[]=upcoming`, plus the current page number. URL encoding is handled automatically.
4. `fetch()` downloads JSON with an `AbortSignal` timeout and redirects disabled; every request consumes the shared external budget. HTTP errors and non-JSON content types reject the run. There is no browser or HTML parser.
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

See `docs/review.md` for verified behavior and the remaining deployment, freshness, and rate-limit work. Open/upcoming are source submission states; actual event dates may remain unknown. URLs in normalized events are restricted to HTTP(S); image downloads additionally require HTTPS. Missing DB/R2 bindings or invalid public URL configuration fail the scheduled handler before source requests begin.
