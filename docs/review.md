# Backend review — 2026-11-01

Reviewed the scraper entry point, Devpost collection and normalization, shared config/contracts, Drizzle client/table/queries, generated migration and metadata, workspace dependencies, tests, and deployment configuration. Frontend application files were not changed.

## Corrected during review

| Finding | Change |
|---|---|
| Only open submissions were requested; upcoming listings were excluded. | Shared config now requests `open` and `upcoming` in the same paginated query. Returned states must match the requested states. |
| Collection could report success when the unique count exceeded the API's reported total. | Reject this inconsistency rather than returning a potentially changing catalogue as complete. This still does not guarantee a snapshot if records change without the total changing. |
| Generic URL validation accepted non-web schemes. | Source and normalized event URLs now require HTTP(S), including normalized images. |
| A missing D1 binding could fail only after all network collection finished. | The scheduled handler checks `env.DB` before fetching. |
| Tests and Drizzle config were not included in package type checks. | Separate test TypeScript configurations now check those files as well as production source. |

## Verification

- The live combined Devpost request reported 166 listings. Full collection returned 166 unique IDs and all records normalized successfully: 44 open and 122 upcoming.
- Nine scraper tests cover multi-page open/upcoming collection, duplicate IDs, valid empty results, HTTP failures, HTML challenges, invalid JSON/response shapes, incomplete/repeated pages, status mismatches, inconsistent totals, source normalization, and URL schemes.
- Six local Miniflare D1 tests cover repeat and older upserts, input validation before writes, active-event filtering, search/pagination, dates, and multiple write batches.
- Config, core, database, and scraper type checks pass, including database/scraper tests. Migration generation reports no schema drift.
- Before this review, a live open-only run was also persisted to isolated local D1 and read back: 44 rows, still 44 after repeat ingestion. The expanded 166-record run verified live collection/normalization; the local database tests verify persistence and multiple batches separately.
- R2 follow-up: twelve additional tests use isolated Miniflare R2/D1 to verify copied bytes and metadata, cache reuse and refresh, absent images, invalid responses, streamed size limits, public URL settings and object-key alignment, and scheduled persistence, bounded external requests, progress across runs, and non-blocking image failures.
- A real Devpost thumbnail for PayPal AI Hackathon was downloaded (37,180 bytes, PNG), copied into isolated local R2, and its public-format URL persisted/read back in isolated D1. This did not create or modify production resources or verify public serving.

Counts are observations, not fixed limits or worldwide totals. The source statuses describe submission availability. We do not infer exact ongoing event dates from them.

## Remaining work

### Source freshness

Upserts update records present in a successful scrape. They do not reconcile records that disappear from later results. Those records can remain open/upcoming indefinitely when actual end dates are unknown. Before production, choose a grace period or another freshness policy, then implement it using complete successful runs. Do not mark missing records ended after a failed or partial scrape. Presently, active reads hide ended status and known expired event dates only.

### Rate limits and source changes

HTTP 429, 403, timeouts, malformed data, and HTML challenges fail the run. Bounded retries/backoff and deferred handling of `Retry-After` are pending. No CAPTCHA handling or bypass is implemented. One malformed source event rejects its page and therefore the run; per-record rejection/reporting is a separate policy decision.

### Deployment and KV follow-up — 2026-11-05

Production image storage moved to Workers KV because R2 activation required a billing method unavailable to the user. No R2 subscription or paid-plan upgrade was performed. The deployment uses a dedicated KV namespace and D1 database in the selected account. `0000_events.sql` is applied remotely. The Worker serves copied raster images through its `workers.dev` origin, with GET/HEAD only, MIME validation, `nosniff`, and one-hour public caching. Private keys, arbitrary source URLs, and public scrape-trigger endpoints are not exposed.

The runtime check found that Workers rejects `redirect: 'error'` before any request. Listing and image downloads now use `manual` and reject redirect responses without following them. Wrangler is pinned to 4.157.0 and runs under Node.js 24. Its development-server forwarding failed under Bun, so the CLI uses the supported Node runtime; the standalone persistent local workflow still runs in Bun.

The suite now has 35 passing tests, including KV bytes/metadata, cache reuse, paginated metadata scans, resumed image batches, GET/HEAD and rejected routes, scheduled KV/D1 integration, persistence after reopening, and importing legacy local R2 objects without overwriting newer KV objects. Config, core, DB, and scraper type checks pass, including scripts/tests. Legacy R2 download/cache tests remain useful through the shared image-storage interface.

A local KV ingestion preserved the previous local database and imported its 58 R2 image objects, then grew to 87 objects (3,164,383 bytes). It processed 184 live events and left 67 event images pending. Subsequent live catalogue changes reduced the current source count to 183.

Two successful invocations through Wrangler's remote preview executed the actual Worker from Cloudflare's network against the real production D1 and KV bindings. The first stored 183 events, 29 KV objects, and images for 59 events; 124 event images remained pending. The second retained all source identities and creation timestamps, advanced update timestamps, reused all 29 previous objects' metadata unchanged, and grew to 58 objects (2,030,385 bytes), with 88 events having images and 95 pending. No image download failures were logged in these two successful runs. Before them, one remote invocation rejected a page containing an out-of-filter source status; the strict validation was retained, diagnostic IDs/statuses were added, and that failed invocation wrote no events. This was not an HTTP 429.

`unknown-scraper` was deployed at `https://unknown-scraper.contact-here-gurkirat-singh.workers.dev` with schedule `0 */6 * * *`, version `eab80514-9eee-4749-aacf-318023cdfc6d`. Startup time reported by deployment was 19 ms. Startup time is not a measurement of scheduled invocation CPU usage. Remote-preview runs do not prove that an automatic production Cron invocation meets the Free plan's CPU allowance. The first automatic six-hour production Cron and its CPU metrics still need observation. The web/Vinext Worker is unchanged and remains a separate deployment.

Production HTTP verification fetched all 58 image URLs and compared every response byte-for-byte with the private KV value. All 2,030,385 bytes matched; content types, content lengths, cache headers, `nosniff`, GET/HEAD, 404s for unrelated paths, and 405s for unsupported methods passed. Source-URL SHA-256 digests matched every image key. API inspection confirmed the real D1/KV bindings, no R2 binding, and the six-hour Cron. A downloaded public sample PNG was visually inspected. Cloudflare rejected a Python urllib probe's default user agent with edge error 1010; curl and the explicitly identified deployment-check client worked.

A bounded production Cron smoke check temporarily registered `* * * * *` while a live tail was attached. The tail captured a successful public image request, proving the log stream was connected, but no scheduled invocation appeared within five minutes. The check restored `0 */6 * * *` in a `finally` block and stopped the tail. Production Cron propagation/first automatic execution and its CPU usage remain unverified; no successful automatic Cron invocation is claimed.

### Stored images and quotas

The image pipeline enforces HTTPS, supported raster MIME types, bounded bytes and timeouts, a 50-external-request budget, missing-image priority, refresh rotation, and 24-hour reuse. KV metadata is scanned once per run with cursor pagination instead of fetching image bodies for freshness checks. Downloads write bytes and metadata together. Per-image failures are logged without blocking event writes; a KV inventory failure aborts the invocation before source ingestion. Pending/new images remain null, existing saved objects survive failed/deferred refreshes, and source-hosted URLs are never substituted. Images are not decoded or transcoded. KV is eventually consistent, so recently saved bytes may take time to appear in other locations. Unreferenced objects are retained; garbage collection is pending.

The Free plan's KV quotas are shared account-wide (1 GB storage, 100,000 reads/day, 1,000 writes/day, 1,000 list requests/day). Four scheduled runs attempt at most 200 image downloads/writes before listing-page requests are deducted; manual runs add usage. The request budget does not bound CPU, retained storage, or other services' quotas. Free Cron CPU is limited to 10 ms and needs deployed measurement. See [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) and [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/).

### Detail fields and frontend integration

The listing API provides formatted submission periods but no reliable exact actual event timestamps or full descriptions. City/country and ambiguous attendance modes remain unknown unless provided reliably. Detail enrichment is pending. Shared schemas and server query helpers are ready for frontend adoption, but the web app's dependency/binding/query integration has deliberately not been changed.

### Write boundaries

Each upsert batch is atomic, but a scrape containing multiple batches is not one transaction. Earlier batches may remain committed if a later batch fails. Source-key idempotency makes a retry safe; the ingestion count is not a count of changed rows. Read pagination is bounded offset pagination and does not offer a snapshot or total count.
