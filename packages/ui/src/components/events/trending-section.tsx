"use client";

import type { ReactNode } from "react";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { EventCardSkeleton } from "./event-card-skeleton";
import { EventCard } from "./event-card";
import type { Hackathon } from "../../types/event";

export function TrendingSection({ events = [], title = "Latest hackathons", loading = false }: { events?: Hackathon[]; title?: string; loading?: boolean }) {
  return (
    <section
      className="mx-auto w-full max-w-site scroll-mt-8 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8"
      id="hackathons"
      aria-busy={loading}
    >
      <SectionHeading action="Explore All Hackathons">
        {title}
      </SectionHeading>
      {loading && <span role="status" className="sr-only">Loading latest hackathons</span>}
      <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {loading ? Array.from({ length: 8 }, (_, index) => <EventCardSkeleton key={index} />) : events.length ? (
          events.map((event) => (
            <EventCard
              key={event.href ?? event.title}
              event={event}
            />
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-radar-line p-12 text-center text-muted">
            No events match your search. Try another keyword or location.
          </div>
        )}
      </div>
    </section>
  );
}

function SectionHeading({
  children,
  action,
}: {
  children: ReactNode;
  action: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <h2 className="flex items-center gap-2 font-display text-[17px] font-extrabold tracking-tight text-ink [&>svg]:shrink-0 sm:gap-3 sm:text-xl">
        {children}
      </h2>
      <a
        className="inline-flex min-h-11 shrink-0 items-center gap-4 rounded-full bg-ink py-1.5 pr-1.5 pl-5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-cyan hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        href="/hackathons"
      >
        {action}
        <span className="grid size-8 place-items-center rounded-full bg-lime text-black">
          <ArrowRight size={17} weight="bold" />
        </span>
      </a>
    </div>
  );
}
