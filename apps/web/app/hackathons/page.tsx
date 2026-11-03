"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { CaretLeftIcon as ChevronLeft } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon as ChevronRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { FunnelIcon as Filter } from "@phosphor-icons/react/dist/csr/Funnel";
import { SlidersHorizontalIcon as SlidersHorizontal } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { Navbar, Dropdown } from "@repo/ui";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/csr/GlobeHemisphereWest";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { EventCard } from "@repo/ui";
import { SiteFooter } from "@repo/ui";

import type { EventMode } from "@repo/ui/types";
import { listingEvents } from "../../data/events";
import { slugify } from "../../lib/slugify";
import { eventDeadline, eventPrize } from "../../lib/event-sort";

const modes = [
  { value: "All", label: "All", icon: SquaresFourIcon },
  { value: "Online", label: "Online", icon: GlobeHemisphereWestIcon },
  { value: "In-person", label: "In person", icon: MapPinIcon },
  { value: "Hybrid", label: "Hybrid", icon: ArrowsLeftRightIcon },
] as const;
const sortOptions = ["Upcoming Deadlines", "Prize Pool", "Recently Added"].map(
  (value) => ({ value, label: value }),
);
const locationOptions = [
  "All Locations",
  ...new Set(listingEvents.map((event) => event.place)),
].map((value) => ({ value, label: value }));

export default function DiscoverHackathonsPage() {
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const updateLayout = () => {
      const fits =
        sidebar.getBoundingClientRect().height <= window.innerHeight - 48;
      sidebar.style.setProperty(
        "--sidebar-position",
        fits ? "sticky" : "static",
      );
    };
    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(sidebar);
    window.addEventListener("resize", updateLayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, []);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<EventMode>("All");
  const [sort, setSort] = useState("Upcoming Deadlines");
  const [location, setLocation] = useState("All Locations");
  const [technology, setTechnology] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = useMemo(
    () =>
      listingEvents
        .filter((event) => {
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
          const matchesLocation =
            location === "All Locations" || event.place === location;
          return (
            matchesQuery && matchesMode && matchesTechnology && matchesLocation
          );
        })
        .sort((a, b) => {
          if (sort === "Prize Pool") return eventPrize(b) - eventPrize(a);
          if (sort === "Upcoming Deadlines")
            return eventDeadline(a) - eventDeadline(b);
          return listingEvents.indexOf(a) - listingEvents.indexOf(b);
        }),
    [query, mode, technology, location, sort],
  );

  return (
    <main className="min-h-screen bg-canvas">
      <Navbar />
      <section className="relative mx-auto max-w-site overflow-hidden px-5 pt-7 pb-4 sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-8 h-80 w-[55%] rounded-full bg-[radial-gradient(ellipse,var(--color-cyan),transparent_70%)] opacity-40 blur-3xl"
        />
        <div className="relative">
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-ink">
            <a href="/" className="hover:text-primary-strong">
              Home
            </a>
            <ChevronRight size={14} />
            <span className="text-ink">Hackathons</span>
          </div>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Discover <span className="text-black">Hackathons</span>
              </h1>
              <p className="mt-2 text-sm text-muted">
                Browse hackathons, compare prizes, and find an event to join.
              </p>
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
            {modes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition ${mode === value ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-muted hover:border-line"}`}
              >
                <Icon size={15} weight="regular" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-site px-5 pb-10 sm:px-8 lg:px-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted lg:hidden"
          >
            <Filter size={16} /> Filters
          </button>
          <span className="hidden text-sm text-muted lg:block">
            {filtered.length} events found
          </span>
          <div className="ml-auto flex items-center gap-2 text-xs font-medium text-muted">
            <span>Sort by</span>
            <Dropdown
              label="Sort events"
              value={sort}
              onValueChange={setSort}
              options={sortOptions}
              className="min-w-44"
            />
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[238px_minmax(0,1fr)]">
          <aside
            ref={sidebarRef}
            className={`${filtersOpen ? "block" : "hidden"} h-fit rounded-2xl border border-line bg-surface p-3 lg:top-6 lg:block lg:self-start lg:[position:var(--sidebar-position,static)]`}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display font-bold text-ink">
                <SlidersHorizontal size={16} /> Filters
              </h2>
              <button
                onClick={() => {
                  setTechnology([]);
                  setMode("All");
                  setLocation("All Locations");
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
                  className="flex cursor-pointer items-center gap-2 py-1 text-xs text-muted lg:min-h-0"
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
              <Dropdown
                label="Filter by location"
                value={location}
                onValueChange={setLocation}
                options={locationOptions}
                className="w-full"
              />
            </FilterGroup>
            <FilterGroup title="Prize Pool">
              {["₹0 – ₹50K", "₹50K – ₹5L", "₹5L +"].map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-2 py-1 text-xs text-muted lg:min-h-0"
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
                  className="flex items-center gap-2 py-1 text-xs text-muted lg:min-h-0"
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
    <section className="border-t border-line py-2">
      <h3 className="mb-1.5 text-sm font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}
