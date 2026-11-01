# Unknown — Architecture

## Intended flow

```text
Public event listings (initially Devpost)
                  │
                  ▼
Scheduled Hono Cloudflare Worker (every 6 hours)
   fetch → parse → normalize → deduplicate/upsert
                  │
                  ├────► Cloudflare R2 (event thumbnails)
                  ▼
             Cloudflare D1
                  │
                  ▼
        Next.js server-side D1 reads
                  │
                  ▼
          Event listing interface
```

The six-hour cadence and read path reflect the latest project notes. A previous draft described a 12-hour schedule and a separate `/api/events` read API; those are not the current direction. Next.js should query D1 server-side, while the scraper Worker writes records to D1.

## Components

### Scraper Worker

The Hono Worker will own source collection. It should fetch supported public pages, parse and normalize event records, upsert them into D1, and record successful scrape times. A Cloudflare scheduled trigger is planned; it is not configured yet. Source failures, retries, and rate limits still need implementation decisions.

### D1

D1 is the structured store for event details and source provenance. The shared model and Drizzle table are documented in [data-model.md](data-model.md). An initial migration and query helpers exist in `packages/db`; real D1 bindings and migration application are pending.

### R2

The scraper copies event thumbnails into a dedicated R2 bucket before D1 upserts. Listing and image fetches share a 50-request budget; thumbnails are deferred across runs while event updates continue. D1 stores their public R2 URLs. Images are cached for 24 hours and refreshed under stable source-URL-hash keys. A real bucket binding and public custom domain remain to be configured; see `apps/scraper/README.md`.

### Next.js

The frontend renders the event discovery experience. Its server-side code will query D1 directly and provide event data to the UI. The browser does not scrape source sites or receive database credentials. The current page is a placeholder.

## Repository layout today

- `apps/scraper`: a plain scheduled Worker handler calling a paginated Devpost JSON collector. Shared config supplies source settings; shared core supplies minimal Zod source schemas. No HTTP routes or browser are needed for listing collection.
- `apps/web`: a minimal Next.js app showing a heading and description.
- Root Cloudflare configuration targets the Vinext application and a response-store worker. It does not configure the planned event scraper, D1, or R2.

The collector validates the minimal source shape and deduplicates by ID. Shared normalized events, a Devpost normalizer, and D1 read/upsert helpers are implemented. The handler requires `env.DB`; real bindings, migration application, Cron Trigger/deployment, and frontend integration remain pending.

## Planned data lifecycle

1. Scheduled trigger starts a scrape run.
2. Source-specific parser fetches listings and extracts available details.
3. The normalizer maps each listing into the common shape in [data-model.md](data-model.md).
4. The worker validates records and upserts on `(platform, source_url)`.
5. Next.js queries D1 server-side and renders active events.
6. Expiry rules hide or remove events whose dates have passed.

## Decisions still needed

- Configure and manually invoke the six-hour scheduled run.
- Choose scrape logging, retry, and source rate-limit behavior.
- Define how missing fields and changed event details are handled.
- Set event expiry policy.
- Configure the R2 image bucket/public domain and decide retention for unreferenced objects.
- Decide whether cross-platform duplicates should be merged; source URL uniqueness alone only prevents duplicate records from the same source listing.
