# HackRadar web

Use Bun for dependencies and project commands. Vinext serves the app with Cloudflare's local Worker runtime and D1. The Cloudflare TypeScript config loader requires Node 24 alongside Bun.

```sh
bun install
bun run --cwd apps/web dev
```

Open http://localhost:3001. The first development start reads a snapshot of the production catalogue and seeds an isolated local D1 database. Authenticate with Wrangler first if needed. Subsequent starts reuse the local database. The frontend always queries local D1 during development; thumbnails use the scraper's existing public KV image URLs.

A cached Node executable at `.local/node` is used when present. If Node is installed outside PATH, set `HACKRADAR_NODE` to its executable before starting development. Bun remains the command runner and package manager.

## Refresh local data

```sh
bun run --cwd apps/web db:pull
bun run --cwd apps/web db:seed
```

`db:pull` reads event records with a SELECT query, without interrupting production traffic. `db:seed` applies shared migrations and replaces only local event records. IDs and timestamps are preserved. Both the seed command and Vite use database ID `4db9817a-d5cc-4c4f-ad6e-1eac61bbac64` and persistence directory `apps/web/.local/state`. Snapshots, migration history, and local databases stay in the ignored `.local/` directory. Stop the development server before replacing local data.

The standard Next command is available as `bun run --cwd apps/web dev:next`; it does not supply Cloudflare Worker bindings. Use Vinext for the database-backed application.

## Runtime

The frontend Worker is `unknown`. Its server components read the `unknown-events` D1 database via the `DB` binding in `cloudflare.config.ts`. No database binding or credentials are sent to the browser. Images are served by `unknown-scraper` from its existing KV namespace. The web app needs no image storage binding.

The home page shows eight latest hackathons. The catalogue lists twelve per page with literal search, source-provided countries, remote attendance, tags, registration status, attendance mode, and stable sorting. Detail URLs use source and source ID rather than titles. Missing records return 404; database failures offer a retry. Production never substitutes sample events.

Country filters use stored country values. Venue names are shown on event cards and detail pages, not listed as countries. Records without country data remain explicitly unspecified. Remote / online filters the source attendance mode.
