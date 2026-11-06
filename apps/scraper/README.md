# Devpost scraper

The Cloudflare Worker in `src/index.ts` collects open/upcoming Devpost listings on a six-hour schedule, normalizes them, stores copied thumbnails in Workers KV, and upserts events into D1. Its HTTP handler serves saved images only. Production uses Workers, D1, and KV; R2 activation and a custom image domain are not required.

## Deploy

Wrangler 4.157.0 is pinned in this package. Use Node.js 24 or newer and Bun, as required by the repository. From the repository root:

```sh
bun install
bun run --cwd apps/scraper cf login --device --browser=false
bun run --cwd apps/scraper cf whoami
bun run --cwd apps/scraper cf d1 list
bun run --cwd apps/scraper cf kv namespace list
```

Select the intended account. Create the following resources only if they do not already exist:

```sh
bun run --cwd apps/scraper cf d1 create unknown-events
bun run --cwd apps/scraper cf kv namespace create EVENT_IMAGES_KV
cp apps/scraper/wrangler.example.jsonc apps/scraper/wrangler.jsonc
```

Add the chosen `account_id`, D1 `database_id`, and KV namespace `id` to `wrangler.jsonc`. This account-specific file is ignored by Git. Keep credentials out of it. If the login can access multiple accounts, supply `CLOUDFLARE_ACCOUNT_ID` when creating resources before the configuration exists.

| Setting | Purpose |
| --- | --- |
| `DB` | D1 event database with `packages/db/migrations` applied |
| `EVENT_IMAGES_KV` | Dedicated KV namespace for copied image bytes and metadata |
| `IMAGE_PUBLIC_BASE_URL` | Worker's public HTTPS origin, e.g. `https://unknown-scraper.YOUR_SUBDOMAIN.workers.dev` |
| `workers_dev` | Enabled so the Worker can serve images without a custom domain |
| Cron | `0 */6 * * *`: 00:00, 06:00, 12:00, 18:00 UTC |

The image base must be an HTTPS domain root without credentials, a path prefix, query, or fragment. URLs use the same `events/<source>/<SHA-256 of source image URL>` paths as the saved objects.

```sh
bun run --cwd apps/scraper deploy:check
bun run --cwd apps/scraper db:migrate:remote
bun run --cwd apps/scraper deploy
bun run --cwd apps/scraper logs
```

The bundle check creates no remote resources. The migration command updates the configured remote database, and deployment publishes the Worker and Cron Trigger. Verify a successful scheduled invocation, remote records, and a saved public image URL:

```sh
bun run --cwd apps/scraper cf d1 execute DB --remote --config wrangler.jsonc --command 'SELECT status, COUNT(*) AS count, COUNT(image_url) AS with_images FROM events GROUP BY status'
```

The Worker serves only `GET` and `HEAD` on `/events/<source>/<64-character lowercase SHA-256>`. Other paths return 404 and other methods on image paths return 405. There is no public endpoint that starts scraping, accepts an arbitrary source URL, or enumerates keys. Images include their validated raster content type, `nosniff`, public cross-origin access, and a one-hour cache lifetime. Missing objects return 404 without an external download. KV is eventually consistent; a newly written image can briefly be unavailable in another location. Failed responses are not given the image cache policy.

## Image caching and request batches

- `@repo/config/images` owns the 15-second download timeout, 5 MiB cap, accepted JPEG/PNG/WebP/GIF/AVIF types, 24-hour refresh interval, and one-hour public cache lifetime. MIME validation does not decode or transcode images.
- Downloads are sequential. Declared and streamed sizes are checked; insecure URLs, redirects, failed responses, unsupported types, and empty bodies are rejected. Workers does not implement `redirect: 'error'`, so downloads use `manual` and reject non-success status codes without following redirects.
- Every invocation scans paginated KV image metadata once. This avoids reading image bodies or making a KV list call per event just to check freshness. Metadata includes source URL, content type, fetch timestamp, and byte size. A successful upload saves bytes and metadata in one KV write.
- Listing collection has priority within a shared budget of 50 external requests. Remaining requests download images. Missing images are prioritized over stale refreshes; the missing order rotates every six hours to reduce starvation. Duplicate source URLs share a download. Recent objects are reused across invocations.
- A run can leave new images null when the budget is exhausted or a download fails. Subsequent scheduled runs collect current listings again, reuse saved objects, and fill another image batch. Existing images stay usable after failed/deferred refreshes. The 50-request platform limit is never raised or bypassed.
- Image failures are logged and do not block event updates. Listing/validation failures abort before event writes. D1 batches commit independently, so a failure after writes begin can leave earlier batches committed; stable source identities make repeat ingestion safe.
- Source-hosted image URLs are never substituted into persisted event records. Old image objects are retained; garbage collection is pending.

Workers Free allows 50 external subrequests and 1,000 internal service subrequests per invocation. KV's free allowance includes 1 GB storage, 100,000 reads/day, 1,000 writes/day, and 1,000 list requests/day, shared with other account usage. Four scheduled runs can attempt at most 200 image downloads/writes per day before listing requests are deducted; manual runs add usage. Retained objects consume storage over time. Free-plan operations fail after their quota is reached. The request budget does not guarantee compliance with every quota or CPU limit: Free Cron CPU has a 10 ms allowance and must be checked in deployed metrics. This configuration does not upgrade the account's plan.

See [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/), [KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works/), and the [Workers Request API](https://developers.cloudflare.com/workers/runtime-apis/request/).

## Persistent local workflow

```sh
bun run --cwd apps/scraper scrape:local
bun run --cwd apps/scraper inspect:local
```

No Cloudflare account is required for these commands. `scrape:local` invokes the same scheduled handler in Bun with real network requests and persistent Miniflare D1/KV bindings. Both commands always dispose of Miniflare; ingestion failures exit unsuccessfully.

Storage is resolved relative to the scraper package under ignored `apps/scraper/.local/`, regardless of the working directory. D1's `local_migrations` ledger applies each shared SQL file once; a migration and its ledger entry commit together. Repeated runs preserve events and images. Local images downloaded by the earlier R2 workflow are copied into KV when their keys are missing, preserving their metadata and existing event paths. Legacy R2 files remain available on disk, and the production Worker has no R2 binding. The image pipeline also retains an R2 adapter-compatible interface for its existing regression tests.

`inspect:local` prints event/status counts, sample records, and KV image object count and bytes. It exports one stored image as `.local/sample-image.<extension>` for inspection. Local image URLs use the placeholder `https://images.local.test`; this command does not start an image server. Read/export bytes through KV, or use Wrangler to exercise the HTTP handler. Run local commands sequentially against the same directory; remove `.local/` while commands are stopped to reset all local data.

## Verification

```sh
bun test apps/scraper/tests packages/db/tests
bun run --filter '@repo/config' --filter '@repo/core' --filter '@repo/db' --filter scraper check-types
```

The suite includes 35 tests: source validation/collection, D1 queries/upserts, download/cache/failure behavior, persistence after dispose/reopen, KV metadata pagination, batch progress, public GET/HEAD responses, rejected private/arbitrary paths, and scheduled KV-to-D1 integration. Scripts and tests are included in type checks.

Before the KV migration, two live local R2 runs saved 184 events (55 open, 129 upcoming), grew from 29 to 58 image objects, and preserved all source identities and creation timestamps. Those objects totaled 1,869,806 bytes. A Worker runtime check then caught and fixed the unsupported redirect mode. These observations describe a changing live catalogue, not fixed expected totals. Current KV/deployment observations are recorded in `docs/review.md` at the repository root.

## Source contracts and remaining work

- `@repo/config/sources` owns the Devpost JSON endpoint, open/upcoming filters, 30-second timeout, 50-page safety cap, and 500 ms page delay. Each request consumes the shared external budget. No HTML parser/browser is used.
- `@repo/core/schemas/devpost` validates each complete page, including positive source IDs, titles, URLs, recognized statuses, and pagination. Source extra fields are preserved. Validation rejects the entire page when an event fails.
- A map deduplicates stable source IDs across pages. Collection returns only after the unique count equals the reported total. A repeated/no-progress page, premature short page, changed total, exhausted budget, or page cap rejects incomplete results. A genuinely empty first page returns an empty catalogue. Live pagination still has no snapshot guarantee.
- `@repo/core/schemas/event` and `event-filters` own the normalized product contracts. `@repo/db` provides Drizzle queries and stable source-key upserts. Unknown actual dates and ambiguous structured locations remain unknown; Devpost submission-period strings are preserved rather than treated as actual event dates.
- The listing endpoint is used by Devpost's website and is not a guaranteed public API. HTTP 429/403, challenges, timeouts, and malformed data fail collection. Bounded retries/backoff are pending; no CAPTCHA bypass is implemented.
- Missing source records are not automatically marked ended. Stale-listing reconciliation, detailed descriptions, image garbage collection, and frontend integration remain pending. The web Worker is a separate deployment and still needs its own D1 binding/query integration.
