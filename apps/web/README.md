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

The deploy script uploads only the frontend Worker (`unknown`) using the existing
build output. It has no database, R2, cache-service, or Cloudflare Images setup.
Always run the build before deploying. The frontend continues to show the sample
events already in the app.

The Worker name in `cloudflare.config.ts` must match the Worker connected to
Workers Builds.

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
