"use client";

import { SearchBar } from "../search/search-bar";
import { StatsRow } from "./stats-row";
import type { SearchHandler } from "../search/search-bar";

export function HeroSection({
  onSearch,
  resultCount,
  submittedQuery,
  loading,
}: {
  onSearch: SearchHandler;
  resultCount?: number;
  submittedQuery?: string;
  loading?: boolean;
}) {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_0%_100%,var(--color-cyan-soft),transparent_50%),radial-gradient(ellipse_at_100%_100%,var(--color-lime-soft),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--color-line)_0.75px,transparent_0.75px)] opacity-40 [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />
      <div className="relative mx-auto flex min-h-[calc(100dvh-var(--spacing-header))] w-full max-w-site flex-col px-4 pb-12 text-center sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <div className="flex flex-col pt-12 sm:pt-16 lg:pt-20">
          <h1 className="mx-auto max-w-6xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl xl:text-7xl">
            Discover Your Next
            <br />
            <span className="text-ink">Hackathon</span> &amp; Developer Event
          </h1>
          <p className="mx-auto mt-6 mb-8 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            Find hackathons, coding competitions, workshops, and developer
            communities. Choose an event and start building.
          </p>
          <SearchBar
            onSearch={onSearch}
            resultCount={resultCount}
            submittedQuery={submittedQuery}
            loading={loading}
          />
          <StatsRow />
        </div>
      </div>
    </section>
  );
}
