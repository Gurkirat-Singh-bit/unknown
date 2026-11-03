"use client";

import type { ReactNode } from "react";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { FireIcon as Flame } from "@phosphor-icons/react/dist/csr/Fire";
import { EventCard } from "./event-card";
import type { Hackathon } from "../../types/event";

export function TrendingSection({ events = [] }: { events?: Hackathon[] }) {
  return (
    <section
      className="mx-auto w-full max-w-site scroll-mt-8 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8"
      id="hackathons"
    >
      <SectionHeading action="Explore All Hackathons">
        <Flame size={22} weight="regular" /> Trending Hackathons
      </SectionHeading>
      <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {events.length ? (
          events.map((event) => (
            <EventCard
              key={event.title}
              event={{
                ...event,
                href: `/hackathons/${event.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")}`,
              }}
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
