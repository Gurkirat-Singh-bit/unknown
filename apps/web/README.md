This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses locally hosted DM Sans and Manrope variable fonts from `packages/ui/src/fonts`, loaded through `@font-face` rules in the shared UI stylesheet.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Workers

The production build uses vinext with the Cloudflare Vite plugin. Configuration
lives beside the app in `vite.config.ts` and `cloudflare.config.ts`. `build:next`
remains available for a standard Next.js build (served with `start:next`).
Use Node.js 24 alongside Bun 1.4.4; the typed Cloudflare config loader requires
Node.js. The root `package.json` pins Bun through `packageManager` so Workers
Builds selects a version that can read `bun.lock` (lockfile version 2).
If the project has a `BUN_VERSION` build variable, set it to `1.4.4` as well.

In Cloudflare Workers Builds, use these settings:

- Root directory: repository root (`/`)
- Install command: `bun install --frozen-lockfile`
- Build command: `bun run build`
- Deploy command: `bun run deploy`

The deploy script ensures the Response Store R2 bucket exists, then uploads the
built Response Store Worker, then the web Worker, using the existing build output.
It does not run Wrangler auto-detection
or install packages during deployment. Always run the build before deploying.
The Response Store command clears `WRANGLER_CI_MATCH_TAG` and
`WRANGLER_CI_OVERRIDE_NAME` for that command because Workers Builds sets them for
the connected web Worker. The web deployment retains those identity checks.

The configured Worker names are `unknown` (web) and `unknown-response-store`
(cache). The web name must match the Worker connected to Workers Builds. To
rename it, update `worker.name` in `cloudflare.config.ts` and the connected Worker
in Cloudflare together. The cache name also appears in `deploy:response-store`.

For local deployment, set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
(or authenticate with `bunx cf auth login`), then run from the repository root:

```sh
bun install --frozen-lockfile
bun run build
bun run deploy
```

To validate deployment configuration without uploading:

```sh
bun run --cwd apps/web deploy:check
```

The `deploy:storage` step reads the bucket name from build output and creates it
only if missing. The deployment token needs **Workers R2 Storage Write** access
to the target account, and R2 must be enabled there. Authentication and permission
errors stop deployment before either Worker is uploaded. The app also retains
the existing Cloudflare Images binding. See the
[vinext Cloudflare guide](https://vinext.dev/docs/deploying/cloudflare).
