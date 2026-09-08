# {{DISPLAY_NAME}}

> {{DESCRIPTION}}

## Requirements

- **Bun 1.4+** — the package manager and script runner for this project (Node/npm/npx are not used).
- **Android** development build — Expo Go may not support all native modules.
- **User-supplied provider credentials** — if your app uses external APIs, you bring your own keys.

## Getting started

```bash
bun install
bun run start
```

Open on a connected Android device directly:

```bash
bun run android
```

Routes live under `src/app` (Expo Router), and the `@/` alias resolves to `src`.

## Validation

```bash
bun run typecheck   # TypeScript, no emit
bun run lint        # ESLint (Expo config)
bun test            # Bun test runner
bun run format      # Prettier (write)
bun run format:check
bun run docs:audit  # JSDoc header audit
bunx expo-doctor    # Expo diagnostics
```

Run the full check set before any build.

## Project structure

```text
src/
  app/          Expo Router routes and navigation layouts
  components/   shared presentational UI
  features/     feature logic — domain, services, hooks
  constants/    stable product and design constants
  assets/       brand marks, icons, images
docs/           architecture, design, and development decisions
scripts/        repo tooling (e.g. the JSDoc header audit)
tests/          Bun tests
```

## Releasing

Tag the commit you want to ship; the release workflow builds the APK, runs the full validation set, and attaches the artifact to a GitHub Release.

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Developer conventions

See [docs/CONVENTIONS.md](docs/CONVENTIONS.md) for the full set. The essentials:

- **TypeScript** for all application source, strict mode.
- **Bun** for installing and running — add packages with `bun add`, never by hand-editing `package.json`.
- **JSDoc file headers** on every source and test file: `@file`, `@description`, `@author`, `@license`. Enforced by `bun run docs:audit`.
- **Phosphor icons** only — no React Icons or Lucide.
- **Design source of truth** lives in [docs/Design.md](docs/Design.md).

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — product areas, runtime, data model, provider and security boundaries.
- [Design](docs/Design.md) — the visual system: color, typography, spacing, shape, interaction, accessibility.
- [Conventions](docs/CONVENTIONS.md) — how the codebase is written, documented, and checked.

## License

Released under the [MIT License](LICENSE).
