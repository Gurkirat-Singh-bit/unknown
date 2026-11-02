# Shared UI

`packages/ui` contains reusable pieces of a screen. The complete screens live in
`apps/web/app`, where Next.js routes are defined.

```text
src/components/
  layout/       Navbar and footer
  events/       Event cards, mode filters, and the event grid
  discovery/    Hero, categories, and statistics
  search/       Search bar and shared search icon
  primitives/   Starter button, card, and code components
```

Each component's Storybook story sits beside it. Helpers used by only one
component stay in that component's file.

`src/types/event.ts` holds the shared event types. `src/hackradar.css` holds
Tailwind imports and theme tokens. Demo event data belongs to `apps/web/data`.
Full-screen Storybook previews in `stories/` import the real app routes.

Import components from `@repo/ui`, or use a direct path such as
`@repo/ui/components/events/event-card`. Import event types from `@repo/ui/types`.

From this directory, run `bun run storybook`, `bun run build-storybook`,
`bun run check-types`, or `bun run lint`.

The blue and slate theme is defined in `src/hackradar.css`. React Bits Gradient
Text is installed as source under `src/components/react-bits`, with its upstream
license alongside it. The hero uses it for the highlighted headline text.
