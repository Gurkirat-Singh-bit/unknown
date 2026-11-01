# Unknown — Devpost implementation tasks

Goal: collect Devpost hackathons on a schedule, store them in D1, and let the web app read them server-side.

This is the work plan; unchecked items have not been implemented. Initial scope is Devpost only. Browser Run is deferred. R2 thumbnail copying is implemented locally; remote setup remains pending. Drizzle and Zod are adopted in shared database and core packages. Frontend integration remains a separate task; no frontend application files were modified.

## 1. Rename and simplify the scraper — Codex

- [x] Rename `apps/api` to `apps/scraper` and its package name from `api` to `scraper`.
- [x] Update workspace references, scripts, and docs that refer to the old name.
- [x] Remove the greeting and `/scrape` HTTP routes, Hono, and `@hono/zod-validator`.
- [x] Remove the unused `inspector/promises` import and Hono JSX settings.
- [x] Add a plain Worker entry point with a `scheduled()` handler and an independently callable `scrapeDevpost()` function.
- [x] Declare scraper dependencies in the scraper package rather than relying on root dependencies.

Done when: the app is named `scraper` and the collection function can run without an HTTP endpoint. Scheduling is configured in step 6.

## 2. Confirm Devpost collection and pagination — Codex

- [x] Inspect embedded JSON-LD as an initial proof of concept; replaced by direct JSON collection.
- [x] Inspect the listing JavaScript's JSON request and establish a reliable way to retrieve subsequent pages.
- [x] Choose embedded JSON or the site's accessible JSON response based on field coverage and pagination.
- [x] Define which listings to collect: open/upcoming, with completed events excluded from active results.
- [x] Handle missing data, non-success responses, pagination termination, and unexpected response shapes.

Done when: collection retrieves multiple pages, preserves stable source identity, and distinguishes a failed scrape from an empty successful result. The JSON collector retrieves open and upcoming listings. The latest live local run collected 166 unique records: 44 open and 122 upcoming. It rejects malformed or incomplete responses, deduplicates by source ID, and caps page requests. Cloudflare runtime access is still unverified.

## 3. Agree on the shared event contract — You + Codex

- [ ] You: confirm the fields your frontend friend needs for cards and filters.
- [x] Adopt Drizzle for shared table definitions, inferred types, and migration generation.
- [x] Codex: implement and document the shared initial event model, including source identity, event dates, mode, tags, location, and scrape timestamps. Frontend owner review remains pending.
- [x] Codex: share minimal Devpost event/page Zod schemas and inferred types in `@repo/core/schemas/devpost`.
- [x] Codex: define the normalized event/record contract and read-filter validators in `@repo/core`. Richer source details remain pending.
- [x] Codex: preserve submission-period text separately and normalize known actual event timestamps to UTC.

Done when: both apps have one agreed event shape and scraped records can be validated before insertion.

## 4. Create D1 and shared database code — You + Codex

- [ ] You: provide the Cloudflare account access/context needed for database creation and deployment.
- [x] Codex: create `packages/db` with the Drizzle schema, generated initial migration, D1 factory, and validated read/upsert helpers.
- [ ] Codex: configure scraper and web bindings to the same production D1 database, with isolated local development data.
- [x] Codex: make `@repo/db` the migration owner; expose `db:generate` and document application through the future Worker configuration.

Done when: both server runtimes can access the agreed schema and share its types/query helpers.

## 5. Persist Devpost records safely — Codex

- [x] Normalize and validate each listing, then upsert by stable source identity through the scheduled handler. Requires real binding/migration setup before deployment.
- [x] Implement idempotent source-key upserts, preserve creation time, and reject older observations from overwriting newer ones.
- [ ] Record successful scrape times and report fetched, inserted/updated, rejected, and failed counts.
- [ ] Respect rate limits and `Retry-After`, cap retries, and stop on challenge pages.
- [ ] Preserve existing data after failures; an incomplete or blocked scrape must not delete listings.
- [ ] Define how events stop appearing after their relevant end date.

Done when: a completed run populates D1 and repeating it does not duplicate records.

## 6. Schedule and deploy the scraper — You + Codex

- [ ] Codex: add Worker deployment configuration and a six-hour Cron Trigger.
- [ ] Codex: document a local/manual way to invoke the scheduled collection logic without a public scrape endpoint.
- [ ] Together: deploy using the configured Cloudflare account and inspect a completed run.
- [ ] Codex: ensure failures are visible in logs and set request/page bounds for a scrape run.

Done when: the deployed scheduled job writes Devpost data to D1.

## 7. Connect the frontend — Frontend owner + Codex

- [ ] Settle the frontend development/deployment path: the repo currently mixes standard Next.js scripts with root Vinext configuration.
- [x] Add a shared `listEvents()` query with bounded pagination, filters, and active-event defaults. Frontend integration remains pending.
- [ ] Read D1 directly from web server code and pass records to the UI.
- [ ] Add a Next.js `/api/events` Route Handler only if browser-driven JSON fetching is needed; reuse `listEvents()` there.
- [ ] Define caching/freshness behavior so successful scrape updates become visible.

Done when: the frontend displays real stored Devpost events and its filters work through the agreed server query path.

## 8. Confirm the complete flow — You + Codex

- [ ] Check a sample of stored records against Devpost for URLs, dates, mode, and location.
- [ ] Confirm pagination, repeat-run deduplication, and preservation of data after a failed run.
- [ ] Confirm a scheduled run updates data shown by the frontend.
- [ ] Update implementation status and copy the finished docs to Second Brain.

## 9. Store event images in R2 — Codex

- [x] Copy HTTPS thumbnails to a dedicated R2 binding before D1 writes, and persist public R2 URLs.
- [x] Reuse recent objects, refresh after 24 hours, and bound download sizes/timeouts.
- [x] Verify local R2 metadata, image bytes, D1 URLs, caching, and event updates despite image failures.
- [x] Document binding/domain setup and provide an example Worker configuration.
- [ ] Create the real image bucket and configure its public custom domain and Worker binding.
- [x] Share a 50-external-request budget across listing pages and images; defer thumbnails across runs, prioritize missing images, and keep event updates independent of image failures.
- [ ] Measure deployed CPU/internal calls against Free limits; split processing further if required.
- [ ] Verify deployed downloads/public serving and define cleanup for unreferenced objects.

Next: configure D1/R2 resources and verify a deployed scrape, then add CI/CD.
