"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  Code2,
  Search,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "@repo/ui";
import { EventCard } from "@repo/ui";
import { SiteFooter } from "@repo/ui";

import type { EventMode } from "@repo/ui/types";
import { listingEvents } from "../../data/events";
import { slugify } from "../../lib/slugify";

const modes: EventMode[] = ["All", "Online", "In-person", "Hybrid"];

export default function DiscoverHackathonsPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<EventMode>("All");
  const [sort, setSort] = useState("Upcoming Deadlines");
  const [technology, setTechnology] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = useMemo(
    () =>
      listingEvents.filter((event) => {
        const matchesQuery = `${event.title} ${event.desc} ${event.organizer}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesMode = mode === "All" || event.mode === mode;
        const matchesTechnology =
          !technology.length ||
          technology.some((tag) =>
            tag === "AI / Machine Learning"
              ? /ai|meta|google/i.test(
                  `${event.title} ${event.desc} ${event.organizer}`,
                )
              : /cloud|devfolio|opensource|web3/i.test(
                  `${event.title} ${event.desc} ${event.organizer}`,
                ),
          );
        return matchesQuery && matchesMode && matchesTechnology;
      }),
    [query, mode, technology],
  );

  return (
    <main className="min-h-screen bg-canvas">
      <Navbar />
      <section className="relative mx-auto max-w-[1396px] overflow-hidden px-5 pt-7 pb-4 sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-0 h-72 w-[48%] rounded-full bg-[radial-gradient(ellipse,var(--color-accent),transparent_68%)]"
        />
        <div className="relative">
          <div className="mb-5 flex items-center gap-2 text-xs text-muted">
            <a href="/" className="hover:text-primary-strong">
              Home
            </a>
            <ChevronRight size={14} />
            <span className="text-primary-strong">Hackathons</span>
          </div>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Discover <span className="text-primary-strong">Hackathons</span>
              </h1>
              <p className="mt-2 text-sm text-muted">
                Find the best hackathons, competitions and developer events
                worldwide.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="hidden h-32 w-64 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-soft/80 to-brand-soft/60 text-primary-strong lg:flex"
            >
              <Code2 size={68} strokeWidth={1.4} />
              <Trophy className="-ml-4 -mt-16" size={30} />
            </div>
          </div>
          <label className="mt-5 flex max-w-[570px] items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 shadow-sm">
            <Search size={17} className="text-muted" />
            <input
              id="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, technology or organizer..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <button
              type="button"
              className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-on-primary hover:bg-primary"
            >
              Search
            </button>
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {modes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${mode === item ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-muted hover:border-line"}`}
              >
                {item === "All"
                  ? "✣  All"
                  : item === "Online"
                    ? "◎  Online"
                    : item === "In-person"
                      ? "♧  In-person"
                      : item}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1396px] px-5 pb-10 sm:px-8 lg:px-10">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted lg:hidden"
          >
            <Filter size={16} /> Filters
          </button>
          <span className="hidden text-sm text-muted lg:block">
            {filtered.length} events found
          </span>
          <label className="ml-auto flex items-center gap-2 text-xs font-medium text-muted">
            Sort by:
            <span className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-lg border border-line bg-surface py-2 pr-8 pl-3 text-xs font-semibold text-ink outline-none"
              >
                <option>Upcoming Deadlines</option>
                <option>Prize Pool</option>
                <option>Recently Added</option>
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
              />
            </span>
          </label>
        </div>
        <div className="grid gap-5 lg:grid-cols-[238px_minmax(0,1fr)]">
          <aside
            className={`${filtersOpen ? "block" : "hidden"} h-fit rounded-2xl border border-line bg-surface p-4 lg:block`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display font-bold text-ink">
                <SlidersHorizontal size={16} /> Filters
              </h2>
              <button
                onClick={() => {
                  setTechnology([]);
                  setMode("All");
                }}
                className="text-xs font-semibold text-primary-strong"
              >
                Clear All
              </button>
            </div>
            <FilterGroup title="Technology">
              {[
                "Web Development",
                "AI / Machine Learning",
                "Data Science",
                "Blockchain",
                "Cybersecurity",
              ].map((tag, i) => (
                <label
                  key={tag}
                  className="flex cursor-pointer items-center gap-2 py-1.5 text-xs text-muted"
                >
                  <input
                    type="checkbox"
                    checked={technology.includes(tag)}
                    onChange={() =>
                      setTechnology((items) =>
                        items.includes(tag)
                          ? items.filter((item) => item !== tag)
                          : [...items, tag],
                      )
                    }
                    className="accent-primary"
                  />
                  {tag}
                  <span className="ml-auto text-[10px] text-muted">
                    ({[242, 289, 243, 176, 122][i]})
                  </span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Location">
              <select className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
                <option>All Locations</option>
                <option>Online</option>
                <option>Bengaluru</option>
              </select>
            </FilterGroup>
            <FilterGroup title="Prize Pool">
              {["₹0 – ₹50K", "₹50K – ₹5L", "₹5L +"].map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 py-1.5 text-xs text-muted"
                >
                  <input type="checkbox" className="accent-primary" />
                  {value}
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Difficulty Level">
              {["Beginner", "Intermediate", "Advanced"].map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 py-1.5 text-xs text-muted"
                >
                  <input type="checkbox" className="accent-primary" />
                  {value}
                </label>
              ))}
            </FilterGroup>
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-3 w-full rounded-lg bg-primary py-2.5 text-xs font-semibold text-on-primary lg:hidden"
            >
              Apply Filters
            </button>
          </aside>
          <section>
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((event) => (
                <EventCard
                  key={event.title}
                  event={{
                    ...event,
                    href: `/hackathons/${slugify(event.title)}`,
                  }}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center text-sm text-muted">
                No hackathons match these filters.
              </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                aria-label="Previous page"
                className="grid size-9 place-items-center rounded-full border border-line bg-surface text-muted"
              >
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`grid size-9 place-items-center rounded-full text-xs font-semibold ${page === 1 ? "bg-primary text-on-primary" : "border border-line bg-surface text-muted"}`}
                >
                  {page}
                </button>
              ))}
              <button
                aria-label="Next page"
                className="grid size-9 place-items-center rounded-full border border-line bg-surface text-muted"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-3">
      <h3 className="mb-2 text-sm font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}
