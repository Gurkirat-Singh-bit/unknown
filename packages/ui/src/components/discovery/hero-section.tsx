"use client";

import { Sparkles } from "lucide-react";
import { SearchBar } from "../search/search-bar";
import { EventFilters } from "../events/event-filters";
import { StatsRow } from "./stats-row";
import GradientText from "../react-bits/gradient-text";
import type { EventMode } from "../../types/event";
import type { SearchHandler } from "../search/search-bar";

export function HeroSection({
  mode,
  onModeChange,
  onSearch,
  resultCount,
  submittedQuery,
  loading,
}: {
  mode: EventMode;
  onModeChange: (mode: EventMode) => void;
  onSearch: SearchHandler;
  resultCount?: number;
  submittedQuery?: string;
  loading?: boolean;
}) {
  return (
    <section
      className="relative overflow-visible bg-surface pb-8 sm:pb-12"
      id="top"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-brand-soft via-accent-soft/20 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-site px-4 pt-7 text-center sm:px-6 lg:px-8 lg:pt-9">
        <div className="mx-auto mb-4 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl bg-surface/95 px-3 py-1.5 text-[10px] text-ink shadow-md shadow-contrast/5">
          <span className="grid size-[18px] place-items-center rounded-full bg-primary text-on-primary">
            <Sparkles size={11} />
          </span>
          <b>1,248+ Events</b>
          <i className="size-[3px] rounded-full bg-primary" />
          <b>500K+ Developers</b>
          <i className="size-[3px] rounded-full bg-primary" />
          <strong className="text-primary-strong">50+ Countries</strong>
        </div>
        <h1 className="mx-auto max-w-4xl font-display text-3xl leading-tight sm:leading-[1.1] font-extrabold tracking-[-1.3px] text-ink sm:text-4xl lg:text-[47px] lg:tracking-[-1.8px]">
          Discover Your Next
          <br />
          <GradientText animationSpeed={8} pauseOnHover>
            Hackathon
          </GradientText>{" "}
          &amp; Developer Event
        </h1>
        <p className="mx-auto my-4 max-w-2xl text-[13px] leading-[21px] text-muted lg:mb-[15px] lg:text-sm">
          Find hackathons, coding competitions, workshops, meetups and developer
          <br className="hidden lg:block" /> communities — all in one place.
        </p>
        <SearchBar
          onSearch={onSearch}
          resultCount={resultCount}
          submittedQuery={submittedQuery}
          loading={loading}
        />
        <EventFilters mode={mode} onChange={onModeChange} />
        <StatsRow />
      </div>
    </section>
  );
}
