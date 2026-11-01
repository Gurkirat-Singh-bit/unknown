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
- Eight scraper tests cover multi-page open/upcoming collection, duplicate IDs, valid empty results, HTTP failures, HTML challenges, invalid JSON/response shapes, incomplete/repeated pages, status mismatches, inconsistent totals, source normalization, and URL schemes.
- Six local Miniflare D1 tests cover repeat and older upserts, input validation before writes, active-event filtering, search/pagination, dates, and multiple write batches.
- Config, core, database, and scraper type checks pass, including database/scraper tests. Migration generation reports no schema drift.
- Before this review, a live open-only run was also persisted to isolated local D1 and read back: 44 rows, still 44 after repeat ingestion. The expanded 166-record run verified live collection/normalization; the local database tests verify persistence and multiple batches separately.

Counts are observations, not fixed limits or worldwide totals. The source statuses describe submission availability. We do not infer exact ongoing event dates from them.

## Remaining work

### Source freshness

Upserts update records present in a successful scrape. They do not reconcile records that disappear from later results. Those records can remain open/upcoming indefinitely when actual end dates are unknown. Before production, choose a grace period or another freshness policy, then implement it using complete successful runs. Do not mark missing records ended after a failed or partial scrape. Presently, active reads hide ended status and known expired event dates only.

### Rate limits and source changes

HTTP 429, 403, timeouts, malformed data, and HTML challenges fail the run. Bounded retries/backoff and deferred handling of `Retry-After` are pending. No CAPTCHA handling or bypass is implemented. One malformed source event rejects its page and therefore the run; per-record rejection/reporting is a separate policy decision.

### Deployment

The scraper has no dedicated deploy configuration, real D1 binding, applied production migration, or Cron Trigger. Root Cloudflare configuration belongs to the web/Vinext setup, not the scheduled scraper. Local Bun collection and local D1 tests do not prove outbound access or resource usage in a deployed Cloudflare Worker. Configure the scraper separately and verify its limits/runtime before deployment.

### Detail fields and frontend integration

The listing API provides formatted submission periods but no reliable exact actual event timestamps or full descriptions. City/country and ambiguous attendance modes remain unknown unless provided reliably. Detail enrichment is pending. Shared schemas and server query helpers are ready for frontend adoption, but the web app's dependency/binding/query integration has deliberately not been changed.

### Write boundaries

Each upsert batch is atomic, but a scrape containing multiple batches is not one transaction. Earlier batches may remain committed if a later batch fails. Source-key idempotency makes a retry safe; the ingestion count is not a count of changed rows. Read pagination is bounded offset pagination and does not offer a snapshot or total count.
