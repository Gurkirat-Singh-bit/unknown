# Unknown — Devpost implementation tasks

Goal: collect Devpost hackathons on a schedule, store them in D1, and let the web app read them server-side.

This is the work plan; unchecked items have not been implemented. Initial scope is Devpost only. Browser Run and R2 are deferred until needed. Drizzle and Zod are recommendations to settle before adding dependencies.

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

Done when: collection retrieves multiple pages, preserves stable source identity, and distinguishes a failed scrape from an empty successful result. The JSON collector retrieves open listings only. A live local run collected 44 unique open records. It rejects malformed or incomplete responses, deduplicates by source ID, and caps page requests. Cloudflare runtime access is still unverified.

## 3. Agree on the shared event contract — You + Codex

- [ ] You: confirm the fields your frontend friend needs for cards and filters.
- [ ] Together: choose Drizzle or plain D1 SQL. Recommendation: Drizzle for shared table definitions, inferred types, and migration generation.
- [ ] Codex: finalize the draft in `data-model.md`, including source identity, event dates, online status, tags, location, and scrape timestamps.
- [x] Codex: share minimal Devpost event/page Zod schemas and inferred types in `@repo/core/schemas/devpost`.
- [ ] Codex: define the normalized event contract and validate remaining fields needed by the database/frontend.
- [ ] Codex: preserve source date meaning and timezone; do not assume a submission deadline is the event start time.

Done when: both apps have one agreed event shape and scraped records can be validated before insertion.

## 4. Create D1 and shared database code — You + Codex

- [ ] You: provide the Cloudflare account access/context needed for database creation and deployment.
- [ ] Codex: create `packages/db` with the schema, initial migration, and database/query helpers using the chosen approach.
- [ ] Codex: configure scraper and web bindings to the same production D1 database, with isolated local development data.
- [ ] Codex: establish one migration command and owner so both apps do not independently manage schema changes.

Done when: both server runtimes can access the agreed schema and share its types/query helpers.

## 5. Persist Devpost records safely — Codex

- [ ] Normalize and validate each listing, then upsert by stable source identity.
- [ ] Repeated runs update existing listings without inserting duplicates.
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
- [ ] Add a shared `listEvents()` query with bounded pagination, supported filters, and upcoming-event rules.
- [ ] Read D1 directly from web server code and pass records to the UI.
- [ ] Add a Next.js `/api/events` Route Handler only if browser-driven JSON fetching is needed; reuse `listEvents()` there.
- [ ] Define caching/freshness behavior so successful scrape updates become visible.

Done when: the frontend displays real stored Devpost events and its filters work through the agreed server query path.

## 8. Confirm the complete flow — You + Codex

- [ ] Check a sample of stored records against Devpost for URLs, dates, mode, and location.
- [ ] Confirm pagination, repeat-run deduplication, and preservation of data after a failed run.
- [ ] Confirm a scheduled run updates data shown by the frontend.
- [ ] Update implementation status and copy the finished docs to Second Brain.

Next: agree on normalized event fields and database access in steps 3 and 4.
