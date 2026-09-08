# {{DISPLAY_NAME}}: Product and Architecture

## 1. Product summary

{{SUMMARY}}

## 2. Product principles

- **Local ownership.** User content lives on the device.
- **Raw words remain available.** AI output never replaces original content.
- **Calm background work.** Saving is immediate; heavy work uses durable jobs.
- **Honest limitations.** Network-backed work cannot be guaranteed while a mobile OS has suspended or killed the app.

The visual system is defined separately in [Design.md](./Design.md). That file is the source of truth for colors, typography, spacing, shapes, interaction styling, and accessibility.

## 3. Product areas

Describe each product area, its responsibilities, and its state handling (idle, loading, empty, error, not-found).

## 4. Navigation model

Use Expo Router for file-based routes and deep links. The intended high-level route map:

```text
Root layout
├── index (home)
└── +not-found
```

Route files should compose features; they should not contain database queries, provider protocols, or large blocks of reusable UI.

## 5. Runtime architecture

Describe how screens, features, and storage fit together. Dependencies point inward: screens depend on feature interfaces; provider and storage adapters implement those interfaces.

## 6. Persistence and data model

Describe the local data model, storage boundaries, and deletion semantics.

## 7. Provider boundaries

Describe any speech, AI, or search integrations. Use small provider-neutral interfaces. Invalid structured output is a recoverable job failure, not data to render optimistically.

## 8. Security and privacy

- Provider keys are user-supplied and stored using the platform secret store.
- Keys never enter SQLite, source control, app exports, crash messages, or ordinary logs.
- Direct provider calls place a key in process memory and transmit user content to that provider.
- Users should be encouraged to use restricted, low-limit keys.

## 9. Offline and background behavior

List what is available offline versus what requires network access. "Background" means the interface remains usable and durable jobs resume safely; it does not guarantee execution after the OS terminates the app.

## 10. Source organization

The repository uses feature-oriented boundaries under `src/` while retaining Expo Router conventions:

```text
src/
  app/                  route composition and navigation layouts
  components/           shared presentational UI and navigation pieces
  features/             feature use cases, domain types, repositories
  constants/            stable product and design constants
  assets/               brand marks, icons, onboarding artwork
docs/                   product, architecture, and design decisions
```

Rules for implementation:

- Keep route files thin and feature logic testable outside the screen.
- Keep constants, provider presets, prompts, and tokens out of main screen files.
- Use TypeScript for application source.
- Use Bun for installing packages and running scripts. Add packages with `bun add`, never by manually editing dependency declarations.
- Add an external dependency only when the platform or a small maintainable module cannot reasonably provide the capability.
- Use Phosphor icons; do not add React Icons or Lucide.
- Provide error, empty, loading, permission-denied, missing-record, and not-found experiences.

## 11. Testing and delivery expectations

At minimum, test:

- Domain parsing and validation for provider responses.
- Database migrations and repository CRUD/cascade behavior.
- Job interruption, retry, and idempotency.
- Secret/export separation.
- Search and sorting behavior.
- Missing capture and invalid route handling.
- Provider endpoint validation.

Before a production build, run the repository's Bun-backed typecheck, lint/format checks, tests, and Expo diagnostics. Native modules must be verified on physical devices.