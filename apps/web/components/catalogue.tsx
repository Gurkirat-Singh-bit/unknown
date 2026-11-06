"use client";

import { useEffect, useState, useTransition } from "react";
import { Dropdown, EventCard, EventCardSkeleton, Skeleton, type Hackathon } from "@repo/ui";
import { useRouter } from "next/navigation";
import { catalogueUrl, type CatalogueOptions } from "../lib/catalogue-url";

const modes = [
  ["", "All"], ["online", "Remote / online"], ["in_person", "In person"],
  ["hybrid", "Hybrid"], ["unknown", "Not specified"],
];

export function Catalogue({ events, total, pages, options, countries, tags, hasUnspecifiedCountry = true }: {
  events: Hackathon[]; total: number; pages: number;
  options: CatalogueOptions; countries: string[]; tags: string[]; hasUnspecifiedCountry?: boolean;
}) {
  const router = useRouter();
  const [navigating, startNavigation] = useTransition();
  const [pendingOptions, setPendingOptions] = useState<CatalogueOptions | null>(null);
  const shownOptions = pendingOptions ?? options;
  useEffect(() => {
    const restored = () => setPendingOptions(null);
    window.addEventListener("pageshow", restored);
    return () => window.removeEventListener("pageshow", restored);
  }, []);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(options.q ?? "");
  const page = options.page ?? 1;
  const navigate = (changes: Partial<CatalogueOptions>) => {
    const next = { ...shownOptions, ...changes, page: 1 };
    const href = catalogueUrl(next);
    if (href === catalogueUrl(options)) return;
    setPendingOptions(next);
    startNavigation(() => router.push(href, { scroll: false }));
  };
  const selectedTags = shownOptions.tags ?? [];
  const prepareNavigation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const href = event.currentTarget.getAttribute("href");
    if (href) startNavigation(() => router.push(href, { scroll: false }));
  };
  return <>
    <section className="relative mx-auto max-w-site overflow-hidden px-5 pt-7 pb-6 sm:px-8 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 right-0 h-80 w-1/2 rounded-full bg-cyan-soft opacity-60 blur-3xl" />
      <div className="relative">
        <nav aria-label="Breadcrumb" className="mb-6 flex gap-2 text-sm text-muted"><a href="/" className="hover:text-ink">Home</a><span>/</span><span className="text-ink">Hackathons</span></nav>
        <span className="text-xs font-bold tracking-[.16em] text-primary-strong uppercase">Find your next challenge</span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Discover Hackathons</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Explore open and upcoming hackathons. Find a theme you care about and start building.</p>
        <form onSubmit={(event) => { event.preventDefault(); navigate({ q: query.trim() || undefined }); }} role="search" className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm">
          <label className="sr-only" htmlFor="catalogue-search">Search title, organizer, or tags</label>
          <input id="catalogue-search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, organizer, or tags…" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none" />
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary">Search</button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Attendance mode">{modes.map(([value, label]) => <button key={label} onClick={() => navigate({ mode: value || undefined, ...(value === "online" ? { country: undefined } : {}) })} aria-pressed={(shownOptions.mode ?? "") === value} className={`min-h-10 rounded-xl border px-4 py-2 text-xs font-semibold transition ${(shownOptions.mode ?? "") === value ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-muted hover:text-ink"}`}>{label}</button>)}</div>
      </div>
    </section>
    <div className="mx-auto max-w-site px-5 pb-14 sm:px-8 lg:px-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted">{navigating ? <span className="inline-flex items-center gap-2"><Skeleton className="h-4 w-10" /> hackathons</span> : <><strong className="text-ink">{total.toLocaleString()}</strong> hackathons found</>}</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} aria-controls="catalogue-filters" className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold lg:hidden">Filters</button>
          <div className="flex items-center gap-2 text-xs text-muted"><span className="whitespace-nowrap">Sort by</span><Dropdown label="Sort hackathons" value={shownOptions.sort ?? "recent"} onValueChange={(sort) => navigate({ sort })} options={[{ value: "recent", label: "Recently added" }, { value: "title", label: "Title A–Z" }]} className="min-w-40 sm:min-w-44" /></div>
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[238px_minmax(0,1fr)]">
        <aside id="catalogue-filters" className={`${filtersOpen ? "block" : "hidden"} rounded-2xl border border-line bg-surface p-5 lg:block`}>
          <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Filters</h2><a onClick={prepareNavigation} href="/hackathons" className="text-xs font-semibold text-primary-strong">Clear all</a></div>
          <FilterGroup title="Registration"><Dropdown label="Registration status" className="w-full" value={shownOptions.status ?? "all"} onValueChange={(status) => navigate({ status: status === "all" ? undefined : status })} options={[{ value: "all", label: "All statuses" }, { value: "open", label: "Open" }, { value: "upcoming", label: "Upcoming" }, { value: "unknown", label: "Not specified" }]} /></FilterGroup>
          <FilterGroup title="Country">
            <Dropdown label="Country or remote" className="w-full" value={shownOptions.country ? `country:${shownOptions.country}` : shownOptions.mode === "online" ? "remote" : "all"} onValueChange={(value) => {
              if (value === "remote") navigate({ mode: "online", country: undefined });
              else navigate({ country: value === "all" ? undefined : value.slice("country:".length), mode: shownOptions.mode === "online" ? undefined : shownOptions.mode });
            }} options={[
              { value: "all", label: "All countries" },
              { value: "remote", label: "Remote / online" },
              ...countries.map((country) => ({ value: `country:${country}`, label: country })),
              ...(hasUnspecifiedCountry ? [{ value: "country:unspecified", label: "Country not specified" }] : []),
            ]} />
            {countries.length === 0 && <p className="mt-2 text-[11px] leading-5 text-muted">Country information isn’t provided in the current listings.</p>}
          </FilterGroup>
          {tags.length > 0 && <FilterGroup title="Tags"><p className="mb-3 text-xs leading-5 text-muted">Match any selected tag.</p><div className="quiet-scrollbar max-h-96 space-y-2 overflow-y-auto pr-3">{tags.map((tag) => <label key={tag} className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-muted"><input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => navigate({ tags: selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag] })} className="mt-1 accent-primary" />{tag}</label>)}</div></FilterGroup>}
        </aside>
        <section aria-label="Hackathon results" aria-busy={navigating}>
          {navigating && <span role="status" className="sr-only">Loading hackathons</span>}
          {navigating ? <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 12 }, (_, index) => <EventCardSkeleton key={index} />)}</div> : events.length > 0 ? <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">{events.map((event) => <EventCard key={event.href ?? event.title} event={event} />)}</div> : <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-20 text-center"><span className="text-4xl" aria-hidden="true">⌕</span><h2 className="mt-4 font-display text-xl font-bold">No hackathons found</h2><p className="mt-2 text-sm text-muted">Try a different search or clear your filters.</p><a href="/hackathons" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary">Clear all filters</a></div>}
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4 text-sm">
            {page > 1 ? <a onClick={prepareNavigation} href={catalogueUrl({ ...options, page: page - 1 })} className="rounded-xl border border-line bg-surface px-4 py-2.5">← Previous</a> : <span aria-disabled="true" className="px-4 py-2.5 text-muted opacity-50">← Previous</span>}
            <span className="text-xs text-muted">{page} / {pages}</span>
            {page < pages ? <a onClick={prepareNavigation} href={catalogueUrl({ ...options, page: page + 1 })} className="rounded-xl border border-line bg-surface px-4 py-2.5">Next →</a> : <span aria-disabled="true" className="px-4 py-2.5 text-muted opacity-50">Next →</span>}
          </nav>
        </section>
      </div>
    </div>
  </>;
}
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-t border-line py-4"><h3 className="mb-3 text-sm font-bold text-ink">{title}</h3>{children}</section>;
}
