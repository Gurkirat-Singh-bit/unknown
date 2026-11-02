"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronDown, Code2, Flame, Globe2, LayoutGrid, Lightbulb, LoaderCircle, MapPin, Menu, Monitor, Search, Sparkles, Trophy, Users, UsersRound, Video, X } from "lucide-react";
import { cloneElement, type ReactElement, type ReactNode } from "react";

export type EventMode = "All" | "Online" | "In-person" | "Hybrid";
export type Hackathon = {
  title: string;
  tagline: string;
  desc: string;
  date: string;
  place: string;
  prize: string;
  mode: Exclude<EventMode, "All">;
  theme: string;
  href?: string;
  category?: string;
  organizer?: string;
  registrationStatus?: "open" | "closed" | "upcoming";
  registrationDeadline?: string;
  featured?: boolean;
  participants?: number;
  teamSize?: string;
};

export const sampleEvents: Hackathon[] = [
  { title: "Developer Summit 2025", tagline: "Build · Learn · Network", desc: "Global Tech Conference & Hackathon", date: "Apr 12 – Apr 14, 2025", place: "Online", prize: "$50,000", mode: "Online", theme: "summit", category: "Hackathons", registrationStatus: "open", featured: true },
  { title: "AI for Good Hackathon", tagline: "Hackathon", desc: "Build solutions for a better tomorrow", date: "Apr 20 – Apr 28, 2025", place: "Online", prize: "$25,000", mode: "Online", theme: "ai", category: "Hackathons", registrationStatus: "open", featured: true },
  { title: "Open Source Hackathon", tagline: "Collaborate · Build · Make Impact", desc: "Contribute to real-world open source projects", date: "May 5 – May 7, 2025", place: "Bengaluru", prize: "$15,000", mode: "In-person", theme: "opensource", category: "Hackathons", registrationStatus: "open", featured: true },
  { title: "Bangalore Hackathon", tagline: "Build. Innovate. Create.", desc: "", date: "May 10 – May 12, 2025", place: "Bengaluru", prize: "$20,000", mode: "In-person", theme: "bangalore", category: "Hackathons", registrationStatus: "open", featured: true },
  { title: "Web3 Hackathon", tagline: "Build the Future", desc: "Build decentralized applications", date: "May 15 – May 20, 2025", place: "Online", prize: "$30,000", mode: "Online", theme: "web3", category: "Hackathons", registrationStatus: "open", featured: true },
];

export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const menuRefs = useRef(new Map<string, HTMLDivElement>());
  const menuTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });
  const currentIndicator = hoveredItem ?? "hackathons";

  const placeIndicator = useCallback((key: string) => {
    const nav = desktopNavRef.current;
    const item = itemRefs.current.get(key);
    if (!nav || !item) return;
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (!navRect.width || !itemRect.width) return;
    setIndicator({ x: itemRect.left - navRect.left, width: itemRect.width });
  }, []);

  useEffect(() => {
    placeIndicator(currentIndicator);
    const nav = desktopNavRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => placeIndicator(currentIndicator));
    observer.observe(nav);
    return () => observer.disconnect();
  }, [currentIndicator, placeIndicator]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
        setMobileOpen(false);
        setHoveredItem(null);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const focusMenuItem = (key: string, direction: "first" | "last" = "first") => {
    const links = menuRefs.current.get(key)?.querySelectorAll<HTMLAnchorElement>("a[role='menuitem']");
    if (!links?.length) return;
    (direction === "first" ? links[0] : links[links.length - 1])?.focus();
  };

  const navItems = [
    { key: "hackathons", label: "Hackathons", href: "#hackathons" },
    { key: "solutions", label: "Solutions", href: "#categories", submenu: [{ label: "Browse Hackathons", href: "#hackathons" }, { label: "Explore Categories", href: "#categories" }] },
    { key: "vibecoding", label: "VibeCoding", href: "#vibecoding", badge: "New" },
    { key: "resources", label: "Resources", href: "#resources", submenu: [{ label: "Developer Resources", href: "#resources" }, { label: "Workshops & Events", href: "#categories" }] },
    { key: "communities", label: "Communities", href: "#communities", submenu: [{ label: "Developer Communities", href: "#communities" }, { label: "Developer Meetups", href: "#categories" }] },
  ];

  const closeDesktopMenus = () => { setHoveredItem(null); setOpenMenu(null); };
  const handleNavKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    setOpenMenu(null);
    setMobileOpen(false);
    setHoveredItem(null);
    if (openMenu) menuTriggerRefs.current.get(openMenu)?.focus();
    else if (mobileOpen) mobileTriggerRef.current?.focus();
  };

  return <header ref={headerRef} onKeyDown={handleNavKeyDown} className="relative z-50 h-[68px] border-b border-violet-100/80 bg-white/90 shadow-[0_4px_20px_rgba(28,20,54,0.045)] backdrop-blur-xl">
    <div className="mx-auto flex h-full max-w-[1396px] items-center px-[18px] sm:px-[4.5%]">
      <a className="flex shrink-0 items-center gap-2.5 font-display text-[19px] font-extrabold tracking-[-0.6px] text-indigo-950 sm:gap-3" href="#top" aria-label="HackRadar home"><span className="grid size-[30px] place-items-center rounded-[9px] rounded-bl-sm bg-gradient-to-br from-violet-500 to-violet-800 text-[23px] leading-none text-white shadow-sm shadow-violet-700/20">h</span><span>HackRadar</span></a>

      <nav ref={desktopNavRef} aria-label="Main navigation" onPointerLeave={closeDesktopMenus} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeDesktopMenus(); }} className="relative isolate ml-[2%] hidden h-[46px] items-center text-[13px] font-medium tracking-[-0.1px] text-slate-600 lg:flex xl:ml-[4%]">
        <SlidingGlassIndicator x={indicator.x} width={indicator.width}/>
        {navItems.map((item) => <div key={item.key} ref={(node) => { if (node) itemRefs.current.set(item.key, node); else itemRefs.current.delete(item.key); }} onPointerEnter={() => { setHoveredItem(item.key); setOpenMenu(item.submenu ? item.key : null); }} onFocusCapture={() => { setHoveredItem(item.key); if (item.submenu) setOpenMenu(item.key); }} className={`relative z-10 h-full shrink-0 items-center px-2.5 xl:px-3.5 ${item.key === "communities" ? "hidden xl:flex" : "flex"}`}>
          <a href={item.href} aria-current={item.key === "hackathons" ? "page" : undefined} className={`relative flex h-full items-center gap-1.5 whitespace-nowrap outline-none transition-colors duration-200 focus-visible:text-violet-700 ${item.key === "hackathons" ? "font-semibold text-violet-700 after:absolute after:right-1 after:bottom-1 after:left-1 after:h-0.5 after:rounded-full after:bg-violet-600" : "hover:text-violet-700"}`}>{item.label}{item.badge && <span className="ml-0.5 rounded-full bg-violet-100/90 px-2 py-0.5 text-[9px] leading-none font-semibold text-violet-700">{item.badge}</span>}</a>
          {item.submenu && <button ref={(node) => { if (node) menuTriggerRefs.current.set(item.key, node); else menuTriggerRefs.current.delete(item.key); }} type="button" aria-label={`Open ${item.label} menu`} aria-haspopup="menu" aria-expanded={openMenu === item.key} aria-controls={`nav-menu-${item.key}`} onClick={() => setOpenMenu(item.key)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setOpenMenu(item.key); requestAnimationFrame(() => focusMenuItem(item.key)); } }} className="ml-0.5 grid size-6 place-items-center rounded-md text-slate-500 outline-none transition hover:text-violet-700 focus-visible:ring-2 focus-visible:ring-violet-500 motion-reduce:transition-none"><ChevronDown size={14} className={`transition-transform duration-200 motion-reduce:transition-none ${openMenu === item.key ? "rotate-180" : ""}`}/></button>}
          {item.submenu && <div className={`absolute top-full left-1/2 z-50 w-60 -translate-x-1/2 pt-2 transition duration-200 ease-out motion-reduce:transition-none ${openMenu === item.key ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"}`}>
            <div ref={(node) => { if (node) menuRefs.current.set(item.key, node); else menuRefs.current.delete(item.key); }} id={`nav-menu-${item.key}`} role="menu" aria-label={`${item.label} links`} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[role='menuitem']")); const current = links.indexOf(document.activeElement as HTMLAnchorElement); const step = event.key === "ArrowDown" ? 1 : -1; links[(current + step + links.length) % links.length]?.focus(); } else if (event.key === "Home" || event.key === "End") { event.preventDefault(); focusMenuItem(item.key, event.key === "Home" ? "first" : "last"); } }} className="rounded-2xl border border-violet-100/80 bg-white/95 p-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
              {item.submenu.map((link) => <a key={link.label} href={link.href} role="menuitem" onClick={() => { setOpenMenu(null); setHoveredItem(null); }} className="group/menu flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors hover:bg-violet-50 hover:text-violet-700 focus-visible:bg-violet-50 focus-visible:text-violet-700">{link.label}<ArrowRight size={14} className="text-violet-500 opacity-0 transition group-hover/menu:translate-x-0.5 group-hover/menu:opacity-100 group-focus-visible/menu:opacity-100"/></a>)}
            </div>
          </div>}
        </div>)}
      </nav>

      <div className="ml-auto flex items-center gap-2.5 sm:gap-4 lg:gap-3 xl:gap-4">
        <button className="group grid size-9 place-items-center rounded-full text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600" aria-label="Focus search" onClick={() => document.getElementById("search")?.focus()}><SearchIcon className="size-[19px] transition-transform duration-200 group-hover:scale-110"/></button>
        <div className="hidden items-center gap-3 lg:flex"><button className="rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-[12px] font-semibold text-slate-800 transition duration-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 xl:px-4">Sign In</button><button className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2.5 text-[12px] font-semibold text-white shadow-md shadow-violet-800/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-700/25 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 xl:px-5">Organize a Hackathon</button></div>
        <button ref={mobileTriggerRef} type="button" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((current) => !current)} className="grid size-10 place-items-center rounded-xl border border-violet-100 bg-white text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-violet-600 motion-reduce:transition-none lg:hidden">{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </div>

    {mobileOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute top-[calc(100%+8px)] right-3 left-3 z-50 rounded-2xl border border-violet-100 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl lg:hidden sm:right-[4.5%] sm:left-[4.5%]">
      <div className="flex flex-col gap-1">
        {navItems.map((item) => <div key={item.key}>
          <div className="flex items-center rounded-xl transition-colors hover:bg-violet-50">
            <a href={item.href} aria-current={item.key === "hackathons" ? "page" : undefined} onClick={() => setMobileOpen(false)} className={`flex min-h-11 flex-1 items-center gap-2 px-3 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 ${item.key === "hackathons" ? "font-semibold text-violet-700" : "text-slate-700"}`}>{item.label}{item.badge && <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] leading-none font-semibold text-violet-700">{item.badge}</span>}</a>
            {item.submenu && <button type="button" aria-label={`Expand ${item.label} links`} aria-expanded={mobileExpanded === item.key} onClick={() => setMobileExpanded((current) => current === item.key ? null : item.key)} className="mr-1 grid size-9 place-items-center rounded-lg text-slate-500 transition hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-violet-600 motion-reduce:transition-none"><ChevronDown size={16} className={`transition-transform duration-200 motion-reduce:transition-none ${mobileExpanded === item.key ? "rotate-180" : ""}`}/></button>}
          </div>
          {item.submenu && mobileExpanded === item.key && <div className="ml-4 border-l border-violet-100 py-1 pl-3">{item.submenu.map((link) => <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="flex min-h-10 items-center justify-between rounded-lg px-3 text-[13px] text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-violet-600">{link.label}<ArrowRight size={14}/></a>)}</div>}
        </div>)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3"><button className="rounded-xl border border-slate-300 px-3 py-2.5 text-[13px] font-semibold text-slate-800 transition hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-600">Sign In</button><button className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-purple-800 focus-visible:outline-2 focus-visible:outline-violet-600">Organize a Hackathon</button></div>
    </nav>}
  </header>;
}

function SlidingGlassIndicator({ x, width }: { x: number; width: number }) {
  return <span aria-hidden="true" className="pointer-events-none absolute inset-y-1 left-0 z-0 rounded-xl border border-violet-200/90 bg-gradient-to-br from-violet-100/95 via-violet-50/95 to-fuchsia-100/85 shadow-[0_4px_16px_rgba(93,45,153,0.18)] backdrop-blur-md transition-[transform,width] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ width, transform: `translate3d(${x}px,0,0)` }}/>;
}

export function SearchIcon({ className = "size-full" }: { className?: string }) { return <Search aria-hidden="true" className={`${className} stroke-slate-600`} strokeWidth={1.8}/>; }

const popularSearches = ["Artificial Intelligence", "Web3", "React", "Open Source", "Hackathons in India"];
type SearchHandler = (value: string) => void | Promise<unknown>;

export function SearchBar({ onSearch, resultCount, submittedQuery = "", loading = false, disabled = false }: { onSearch: SearchHandler; resultCount?: number; submittedQuery?: string; loading?: boolean; disabled?: boolean }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPending, setIsPending] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = loading || isPending;
  const normalizedQuery = query.trim();
  const filteredSuggestions = popularSearches.filter((suggestion) => suggestion.toLowerCase().includes(normalizedQuery.toLowerCase()));
  const hasNoResults = Boolean(normalizedQuery && submittedQuery === normalizedQuery && resultCount === 0);
  const visibleSuggestions = hasNoResults
    ? popularSearches.map((suggestion) => ({ label: suggestion, value: suggestion }))
    : filteredSuggestions.length > 0
      ? filteredSuggestions.map((suggestion) => ({ label: suggestion, value: suggestion }))
      : normalizedQuery
        ? [{ label: `Search for “${normalizedQuery}”`, value: normalizedQuery }]
        : [];

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (hasNoResults && !isLoading) setIsOpen(true);
  }, [hasNoResults, isLoading]);

  const runSearch = (value: string) => {
    const term = value.trim();
    setSearchError(false);
    setActiveIndex(-1);
    if (!term) {
      setQuery("");
      onSearch("");
      setIsOpen(true);
      return;
    }

    setQuery(term);
    setIsOpen(false);
    try {
      const result = onSearch(term);
      if (result && typeof result.then === "function") {
        setIsPending(true);
        setIsOpen(true);
        void Promise.resolve(result).catch(() => { setSearchError(true); setIsOpen(true); }).finally(() => setIsPending(false));
      }
    } catch {
      setSearchError(true);
      setIsOpen(true);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || isLoading) return;
    runSearch(normalizedQuery);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!isOpen || isLoading) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, visibleSuggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, -1));
    } else if (event.key === "Enter" && activeIndex >= 0 && visibleSuggestions[activeIndex]) {
      event.preventDefault();
      runSearch(visibleSuggestions[activeIndex].value);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchError(false);
    setActiveIndex(-1);
    onSearch("");
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return <div ref={searchRef} className="relative z-20 mx-auto w-full max-w-[560px]">
    <form aria-busy={isLoading} onSubmit={handleSubmit} className="flex h-14 w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 shadow-[0_5px_20px_rgba(24,24,44,0.07)] transition duration-200 hover:border-slate-300 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100 sm:px-5">
      <SearchIcon className="size-5 shrink-0"/>
      <input ref={inputRef} id="search" role="combobox" aria-autocomplete="list" aria-expanded={isOpen && !disabled} aria-controls="hackradar-search-suggestions" aria-activedescendant={activeIndex >= 0 ? `hackradar-search-option-${activeIndex}` : undefined} value={query} disabled={disabled || isLoading} onFocus={() => setIsOpen(true)} onKeyDown={handleInputKeyDown} onChange={(event) => { setQuery(event.target.value); setIsOpen(true); setActiveIndex(-1); setSearchError(false); }} placeholder="Search hackathons, events, technologies..." className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400 transition placeholder:transition-colors focus:placeholder:text-slate-300 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"/>
      {query && !isLoading && <button type="button" aria-label="Clear search" onClick={clearSearch} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-violet-600"><X size={17}/></button>}
      <button type="submit" disabled={disabled || isLoading} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-[13px] font-semibold text-white transition duration-200 hover:bg-violet-700 active:scale-[0.98] active:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:bg-violet-300 disabled:active:scale-100 sm:px-5">
        {isLoading ? <><LoaderCircle size={16} className="animate-spin motion-reduce:animate-none"/>Searching</> : "Search"}
      </button>
    </form>

    {isOpen && !disabled && <div id="hackradar-search-suggestions" role="presentation" className="absolute top-[calc(100%+8px)] right-0 left-0 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
      {isLoading ? <p role="status" className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin text-violet-600 motion-reduce:animate-none"/>Searching events…</p> : searchError ? <p role="status" className="px-3 py-3 text-sm text-rose-600">Search couldn’t be completed. Please try again.</p> : isOpen && <>
        {hasNoResults && <div role="status" className="px-3 pb-2 pt-1"><p className="text-sm font-semibold text-slate-800">No matching events found</p><p className="mt-1 text-xs text-slate-500">Try another keyword or browse a popular search.</p></div>}
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">{normalizedQuery && !hasNoResults ? "Suggestions" : "Popular searches"}</p>
        <ul role="listbox" aria-label={normalizedQuery && !hasNoResults ? "Search suggestions" : "Popular searches"}>
          {visibleSuggestions.map((suggestion, index) => <li id={`hackradar-search-option-${index}`} key={suggestion.value} role="option" aria-selected={activeIndex === index} onMouseDown={(event) => event.preventDefault()} onClick={() => runSearch(suggestion.value)} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${activeIndex === index ? "bg-violet-50 text-violet-800" : "text-slate-700 hover:bg-slate-50"}`}><Search size={15} className="shrink-0 text-slate-400"/>{suggestion.label}</li>)}
        </ul>
      </>}
    </div>}
  </div>;
}

export function EventFilters({ mode, onChange }: { mode: EventMode; onChange: (mode: EventMode) => void }) {
  const options: [EventMode, ReactNode][] = [["All", <LayoutGrid size={17} strokeWidth={2} key="grid"/>], ["Online", <Monitor size={17} strokeWidth={2} key="monitor"/>], ["In-person", <MapPin size={17} strokeWidth={2} key="pin"/>], ["Hybrid", <Globe2 size={17} strokeWidth={2} key="globe"/>]];
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex < 0) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
    buttons[nextIndex]?.click();
  };

  return <div className="mx-auto mt-3 w-full max-w-[560px] overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onKeyDown={handleKeyDown} role="group" aria-label="Filter events by format"><div className="flex w-max min-w-full justify-center gap-2">
    {options.map(([label, icon]) => { const active = mode === label; return <button type="button" key={label} aria-pressed={active} onClick={() => onChange(label)} className={`inline-flex h-11 min-w-[82px] shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-[13px] tracking-[-0.05px] transition duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 motion-reduce:transition-none motion-reduce:active:scale-100 ${active ? "border-radar-purple bg-radar-purple font-semibold text-white shadow-[0_4px_12px_rgba(118,24,245,0.24)] hover:brightness-105" : "border-[#D8DEEA] bg-white font-medium text-[#34415B] hover:border-violet-300 hover:bg-[#F5F0FF]"}`}><span className={active ? "text-white" : "text-[#26334D]"}>{icon}</span>{label}</button>; })}
  </div></div>;
}

export function HeroSection({ mode, onModeChange, onSearch, resultCount, submittedQuery, loading }: { mode: EventMode; onModeChange: (mode: EventMode) => void; onSearch: SearchHandler; resultCount?: number; submittedQuery?: string; loading?: boolean }) {
  return <section className="relative h-auto overflow-visible bg-white pb-6 lg:h-[425px] lg:pb-0" id="top"><div className="pointer-events-none absolute inset-x-0 top-0 h-[295px] bg-[radial-gradient(ellipse_47%_74%_at_51%_0%,#efb3ffb8,transparent_80%),radial-gradient(ellipse_34%_76%_at_90%_0%,#ffc6e6a8,transparent_80%),radial-gradient(ellipse_34%_76%_at_12%_0%,#ead2ffb5,transparent_80%)]"/><div className="relative px-[18px] pt-7 text-center lg:px-0 lg:pt-9"><div className="mx-auto mb-3 flex h-[29px] w-max max-w-[90%] items-center gap-2.5 rounded-2xl bg-white/95 px-3 text-[10px] text-slate-900 shadow-md shadow-slate-900/5"><span className="grid size-[18px] place-items-center rounded-full bg-violet-600 text-white"><Sparkles size={11}/></span><b>1,248+ Events</b><i className="size-[3px] rounded-full bg-violet-600"/><b>500K+ Developers</b><i className="size-[3px] rounded-full bg-violet-600"/><strong className="text-violet-700">50+ Countries</strong></div><h1 className="font-display text-[32px] leading-[1.1] font-extrabold tracking-[-1.3px] text-slate-950 sm:text-4xl lg:text-[47px] lg:tracking-[-1.8px]">Discover Your Next<br/><span className="text-violet-600">Hackathon</span> &amp; Developer Event</h1><p className="mx-auto my-3 max-w-[95%] text-[13px] leading-[21px] text-slate-600 lg:mb-[15px] lg:text-sm">Find hackathons, coding competitions, workshops, meetups and developer<br className="hidden lg:block"/> communities — all in one place.</p><SearchBar onSearch={onSearch} resultCount={resultCount} submittedQuery={submittedQuery} loading={loading}/><EventFilters mode={mode} onChange={onModeChange}/><StatsRow/></div></section>;
}

type Statistic = { icon: ReactNode; label: string; target: number; finalValue: string; format: (value: number) => string };

const statistics: Statistic[] = [
  { icon: <CalendarDays/>, label: "Hackathons", target: 1248, finalValue: "1,248+", format: (value) => `${Math.floor(value).toLocaleString("en-US")}+` },
  { icon: <UsersRound/>, label: "Community Members", target: 500, finalValue: "500K+", format: (value) => `${Math.floor(value)}K+` },
  { icon: <Code2/>, label: "Countries", target: 50, finalValue: "50+", format: (value) => `${Math.floor(value)}+` },
  { icon: <Users/>, label: "Developers", target: 100, finalValue: "100K+", format: (value) => `${Math.floor(value)}K+` },
];

export function StatsRow() {
  return <div className="mx-auto mt-6 grid w-full max-w-[1040px] grid-cols-2 gap-x-3 gap-y-4 text-left sm:gap-x-6 lg:mt-7 lg:grid-cols-4 lg:gap-x-8">
    {statistics.map((stat) => <Stat key={stat.label} {...stat}/>)}
  </div>;
}

function Stat({ icon, label, target, finalValue, format }: Statistic) {
  const statRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(target);

  useEffect(() => {
    const node = statRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || started) return;
      started = true;
      observer.disconnect();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCount(target);
        return;
      }

      const startTime = performance.now();
      const duration = 700;
      setCount(0);
      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(target * eased));
        if (progress < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target]);

  return <div ref={statRef} className="group flex min-w-0 items-center gap-3 sm:gap-4">
    <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-violet-100 bg-violet-50/80 text-violet-600 transition-colors duration-200 group-hover:bg-violet-100 motion-reduce:transition-none [&>svg]:size-6 [&>svg]:stroke-[2]">
      <span className="transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none">{icon}</span>
    </span>
    <p className="flex min-w-0 flex-col gap-1">
      <b aria-label={finalValue} className="text-[20px] leading-none font-extrabold tracking-[-0.4px] text-violet-700 sm:text-[21px]">{count === target ? finalValue : format(count)}</b>
      <span className="text-[12px] leading-4 text-slate-600 sm:text-[13px]">{label}</span>
    </p>
  </div>;
}

const coverStyle: Record<string, string> = {
  summit: "bg-[linear-gradient(120deg,#6915ff,#961cf0_53%,#0076fa)] before:bg-[repeating-linear-gradient(60deg,transparent_0_36px,#ffffff10_37px_44px)] after:bg-[radial-gradient(circle_at_90%_80%,#00d8eb75,transparent_28%),radial-gradient(circle_at_48%_20%,#df24ff6b,transparent_32%)]",
  ai: "bg-[linear-gradient(115deg,#101a2b,#080d15_62%,#1c2910)] before:bg-[linear-gradient(90deg,#080d15e8_0%,#080d15a6_58%,#080d154d_100%),radial-gradient(ellipse_at_86%_80%,#86db00a1,transparent_42%),repeating-linear-gradient(130deg,transparent_0_40px,#ffffff08_42px_48px)]",
  opensource: "bg-[linear-gradient(135deg,#f4ebff,#fff_55%,#e5d0ff)] text-indigo-950 before:bg-[repeating-linear-gradient(130deg,transparent_0_30px,#a358ed14_32px_48px)]",
  bangalore: "bg-[linear-gradient(180deg,#0b1d45_0%,#156ab5_65%,#da6130_100%)] before:bg-[linear-gradient(90deg,#07142ee6_0%,#07142e80_58%,#07142e20_100%),linear-gradient(0deg,#060f26a8,transparent_65%),radial-gradient(ellipse_at_50%_100%,#ff8a29,transparent_35%)]",
  web3: "bg-[linear-gradient(125deg,#d8fa00,#a5ed09_48%,#eefc42)] text-black before:bg-[radial-gradient(circle_at_85%_75%,#a938fb_0_12%,transparent_13%),radial-gradient(circle_at_70%_20%,#ffffff99_0_6%,transparent_7%),repeating-linear-gradient(130deg,transparent_0_29px,#ffffff40_30px_42px)]",
};

const modeBadgeStyles: Record<Exclude<EventMode, "All">, string> = {
  Online: "bg-emerald-500 text-white",
  "In-person": "bg-violet-600 text-white",
  Hybrid: "bg-blue-600 text-white",
};

export function EventCard({ event, onSelect }: { event: Hackathon; onSelect?: (event: Hackathon) => void }) {
  const interactive = Boolean(event.href || onSelect);
  const card = <article role={!event.href && onSelect ? "button" : undefined} tabIndex={!event.href && onSelect ? 0 : undefined} aria-label={!event.href && onSelect ? `View details for ${event.title}` : undefined} onClick={!event.href && onSelect ? () => onSelect(event) : undefined} onKeyDown={!event.href && onSelect ? (keyEvent) => { if (keyEvent.key === "Enter" || keyEvent.key === " ") { keyEvent.preventDefault(); onSelect(event); } } : undefined} className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-[0_2px_10px_rgba(20,30,55,0.04)] outline-none transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_14px_28px_rgba(43,31,74,0.11)] focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${interactive ? "cursor-pointer" : ""}`}>
    <div className="group/poster relative isolate aspect-[1.9/1] max-h-[220px] min-h-[180px] w-full shrink-0 overflow-hidden bg-slate-900">
      <div className={`absolute inset-0 transition-transform duration-300 group-hover:scale-[1.045] motion-reduce:transition-none before:pointer-events-none before:absolute before:inset-0 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:content-[''] ${coverStyle[event.theme] ?? coverStyle.summit}`}/>
      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.035] motion-reduce:transition-none"><PosterArtwork theme={event.theme}/></div>
      <div className="absolute inset-x-0 top-0 z-[2] flex items-center justify-between gap-2 p-4 sm:p-5">
        <span className={`max-w-[65%] truncate rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] ${event.theme === "opensource" ? "bg-violet-100/90 text-indigo-950" : event.theme === "web3" ? "bg-slate-950/10 text-slate-950" : "border border-white/25 bg-slate-950/15 text-white backdrop-blur-sm"}`}>{event.organizer ?? event.category ?? "HACKATHON"}</span>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold shadow-sm ${modeBadgeStyles[event.mode]}`}>{event.mode === "In-person" ? <MapPin size={14} strokeWidth={2}/> : event.mode === "Hybrid" ? <Globe2 size={14} strokeWidth={2}/> : <Monitor size={14} strokeWidth={2}/>} {event.mode}</span>
      </div>
      <div className={`absolute inset-x-4 top-[48px] z-[2] max-w-[78%] font-display text-[22px] leading-[1.05] font-extrabold tracking-[-0.6px] sm:inset-x-5 sm:top-[52px] sm:text-[25px] ${event.theme === "opensource" ? "max-w-[70%] text-indigo-950" : event.theme === "web3" ? "max-w-[72%] text-slate-950" : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"}`}>{event.title}</div>
      <div className={`absolute inset-x-4 bottom-4 z-[2] line-clamp-1 max-w-[75%] text-[11px] font-semibold sm:inset-x-5 ${event.theme === "opensource" || event.theme === "web3" ? "text-indigo-950" : "text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"}`}>{event.tagline}</div>
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-[18px]">
      {(event.registrationStatus || event.featured) && <div className="mb-2.5 flex flex-wrap items-center gap-2">
        {event.registrationStatus && <RegistrationBadge status={event.registrationStatus}/>}
        {event.featured && <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-2.5 py-1.5 text-[10px] font-semibold leading-none text-pink-700"><Sparkles size={13} strokeWidth={2}/> Featured</span>}
      </div>}
      <h3 className="mb-1.5 line-clamp-2 font-display text-[19px] leading-[1.2] font-bold tracking-[-0.3px] text-slate-900 transition-colors duration-200 group-hover:text-violet-800">{event.title}</h3>
      {event.desc && <p className="mb-3 line-clamp-2 text-[13px] leading-[1.45] text-slate-600">{event.desc}</p>}
      {event.organizer && <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600"><Users size={14} strokeWidth={2}/>{event.organizer}</p>}
      <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-slate-200 pt-3 text-[12px] leading-4 font-medium text-slate-700">
        <MetadataItem icon={<CalendarDays size={15} strokeWidth={2}/>} label={event.date} className="col-span-2"/>
        <MetadataItem icon={<MapPin size={15} strokeWidth={2}/>} label={event.place}/>
        <MetadataItem icon={<Trophy size={15} strokeWidth={2}/>} label={event.prize}/>
        {event.registrationDeadline && <MetadataItem icon={<CalendarDays size={15} strokeWidth={2}/>} label={`Register by ${event.registrationDeadline}`} className="col-span-2"/>}
        {event.teamSize && <MetadataItem icon={<Users size={15} strokeWidth={2}/>} label={event.teamSize}/>}
        {typeof event.participants === "number" && <MetadataItem icon={<Users size={15} strokeWidth={2}/>} label={`${event.participants.toLocaleString()} participants`}/>}
      </div>
    </div>
  </article>;
  return event.href ? <a href={event.href} aria-label={`View ${event.title}`} className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2">{card}</a> : card;
}

function RegistrationBadge({ status }: { status: NonNullable<Hackathon["registrationStatus"]> }) {
  const labels = { open: "Registration Open", closed: "Registration Closed", upcoming: "Registration Soon" };
  const colors = status === "open" ? "bg-emerald-50 text-emerald-800" : status === "closed" ? "bg-slate-100 text-slate-700" : "bg-blue-50 text-blue-800";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold leading-none ${colors}`}>{status === "open" ? <CheckCircle2 size={13} strokeWidth={2}/> : <CalendarDays size={13} strokeWidth={2}/>} {labels[status]}</span>;
}

function MetadataItem({ icon, label, className = "" }: { icon: ReactNode; label: string; className?: string }) {
  return <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}><span className="shrink-0 text-slate-600">{icon}</span><span className="truncate">{label}</span></span>;
}

function PosterArtwork({ theme }: { theme: string }) {
  if (theme === "summit") return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-10 -right-7 size-40 rounded-full border border-white/20"/>
    <div className="absolute -top-4 right-2 size-24 rotate-45 border border-cyan-200/30"/>
    <div className="absolute right-6 bottom-[-30px] grid size-28 rotate-12 grid-cols-2 gap-1.5 opacity-55"><span className="rounded-lg border border-white/35 bg-white/10"/><span className="rounded-lg bg-cyan-200/20"/><span className="rounded-lg bg-indigo-300/25"/><span className="rounded-lg border border-white/25"/></div>
    <Code2 className="absolute right-[18%] top-[37%] size-6 text-white/60" strokeWidth={1.7}/>
  </div>;
  if (theme === "ai") return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -right-7 -bottom-12 size-40 rounded-full bg-lime-400/15 blur-xl"/>
    <div className="absolute top-1/2 right-7 size-20 -translate-y-1/2 rotate-12 rounded-[22px] border border-lime-300/40 bg-lime-300/10 shadow-[0_0_28px_rgba(163,230,53,0.12)]"/>
    <div className="absolute top-[24%] right-[22%] size-9 rotate-45 border border-emerald-200/45 bg-emerald-300/10"/>
    <div className="absolute right-[18%] bottom-[24%] size-2.5 rounded-full bg-lime-300/90 shadow-[0_0_12px_rgba(190,242,100,0.65)]"/>
  </div>;
  if (theme === "opensource") return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle,#8b5cf620_1px,transparent_1px)] [background-size:14px_14px]"/>
    <div className="absolute top-1/2 right-8 grid size-16 -translate-y-1/2 place-items-center rounded-2xl border border-violet-200/70 bg-white/55 text-violet-500/65"><Code2 size={31} strokeWidth={1.6}/></div>
    <div className="absolute top-7 right-24 size-12 rotate-45 rounded-lg border border-fuchsia-200/60"/>
  </div>;
  if (theme === "bangalore") return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute right-0 bottom-0 flex h-[48%] items-end gap-0.5 opacity-65">{[35, 48, 40, 62, 44, 70, 52, 38].map((height, index) => <span key={index} className="w-4 rounded-t-sm border border-white/10 bg-slate-950/35" style={{ height: `${height}%` }}><span className="mt-1.5 block size-1 bg-amber-200/70"/></span>)}</div>
    <div className="absolute right-[18%] bottom-0 h-[58%] w-px bg-orange-200/45"/>
    <div className="absolute right-[18%] bottom-[58%] size-2 -translate-x-1/2 rounded-full bg-orange-200/90 shadow-[0_0_12px_5px_rgba(253,186,116,0.32)]"/>
  </div>;
  if (theme === "web3") return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-9 right-8 size-28 rotate-45 border border-fuchsia-500/25"/>
    <div className="absolute right-10 bottom-[-24px] size-20 rotate-45 rounded-xl bg-violet-600/70 shadow-[0_0_22px_rgba(147,51,234,0.22)]"/>
    <div className="absolute right-24 bottom-7 size-12 rotate-45 border border-lime-950/20"/>
  </div>;
  return null;
}

function SectionHeading({ children, action }: { children: React.ReactNode; action: string }) { return <div className="mb-3 flex h-9 items-center justify-between"><h2 className="flex items-center gap-2 font-display text-[17px] font-extrabold tracking-tight text-indigo-950 sm:gap-3 sm:text-xl">{children}</h2><a className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 sm:text-xs" href="/hackathons">{action} <ArrowRight size={15}/></a></div>; }

export function TrendingSection({ events = sampleEvents }: { events?: Hackathon[] }) {
  return <section className="mx-[18px] max-w-[1396px] pt-3 lg:mx-auto lg:px-0" id="hackathons">
    <SectionHeading action="Explore All Hackathons"><Flame size={22} fill="currentColor" strokeWidth={1.8}/> Trending Hackathons</SectionHeading>
    <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.length ? events.map((event) => <EventCard key={event.title} event={{ ...event, href: `/hackathons/${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}` }}/>) : <div className="col-span-full rounded-xl border border-dashed border-radar-line p-12 text-center text-slate-500">No events match your search. Try another keyword or location.</div>}
    </div>
  </section>;
}

const categories: { icon: ReactNode; title: string; count: string; iconColor: string; iconBackground: string; hoverBackground: string; accent: string }[] = [
  { icon: <Trophy/>, title: "Hackathons", count: "1,200+ events", iconColor: "text-violet-700", iconBackground: "bg-violet-50", hoverBackground: "group-hover:bg-violet-100", accent: "bg-violet-500" },
  { icon: <UsersRound/>, title: "Developer Meetups", count: "800+ events", iconColor: "text-emerald-700", iconBackground: "bg-emerald-50", hoverBackground: "group-hover:bg-emerald-100", accent: "bg-emerald-500" },
  { icon: <Code2/>, title: "Coding Competitions", count: "500+ events", iconColor: "text-pink-700", iconBackground: "bg-pink-50", hoverBackground: "group-hover:bg-pink-100", accent: "bg-pink-500" },
  { icon: <Lightbulb/>, title: "Workshops", count: "300+ events", iconColor: "text-amber-700", iconBackground: "bg-amber-50", hoverBackground: "group-hover:bg-amber-100", accent: "bg-amber-500" },
  { icon: <Video/>, title: "Online Events", count: "1,000+ events", iconColor: "text-blue-700", iconBackground: "bg-blue-50", hoverBackground: "group-hover:bg-blue-100", accent: "bg-blue-500" },
  { icon: <Users/>, title: "Communities", count: "50+ communities", iconColor: "text-green-700", iconBackground: "bg-green-50", hoverBackground: "group-hover:bg-green-100", accent: "bg-green-500" },
];

export function CategoryGrid({ onSelectCategory, activeCategory = null }: { onSelectCategory?: (category: string) => void; activeCategory?: string | null }) {
  return <section className="mx-[18px] max-w-[1396px] pt-7 lg:mx-auto lg:px-0" id="categories">
    <div className="mb-4 flex items-start justify-between gap-4 sm:mb-5">
      <div>
        <h2 className="flex items-center gap-2.5 font-display text-[18px] font-extrabold tracking-tight text-indigo-950 sm:gap-3 sm:text-xl">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-indigo-950 text-white"><Globe2 size={14} strokeWidth={2}/></span>
          Explore by Category
        </h2>
        <p className="mt-1.5 ml-[34px] max-w-[290px] text-[12px] leading-relaxed text-slate-600 sm:max-w-none sm:text-[13px]">Find the perfect event, community, or opportunity that matches your goals.</p>
      </div>
      <a className="group inline-flex shrink-0 items-center gap-1.5 pt-1.5 text-[12px] font-semibold text-violet-700 transition-colors hover:text-violet-900 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600 sm:text-[13px]" href="#categories">
        View All <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1"/>
      </a>
    </div>
    <div className="grid auto-rows-fr grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 xl:gap-4">
      {categories.map(({ icon, title, count, iconColor, iconBackground, hoverBackground, accent }) => {
        const isActive = activeCategory === title;
        return <a
          href="#hackathons"
          key={title}
          aria-label={`${title}, ${count}`}
          aria-current={isActive ? "true" : undefined}
          onClick={() => onSelectCategory?.(title)}
          className={`group relative flex min-h-[88px] items-center gap-3 overflow-hidden rounded-[14px] border bg-white px-3.5 py-3.5 transition-all duration-200 ease-out hover:-translate-y-[3px] hover:border-violet-200 hover:shadow-[0_8px_22px_rgba(36,24,73,0.08)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:min-h-[96px] sm:gap-3.5 sm:px-4 ${isActive ? "border-violet-300 shadow-[0_0_0_1px_rgba(139,92,246,0.12)]" : "border-[#E7EAF2]"}`}
        >
          <span aria-hidden="true" className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 ${accent} ${isActive ? "opacity-100" : ""}`}/>
          <span aria-hidden="true" className={`grid size-12 shrink-0 place-items-center rounded-[14px] transition duration-200 group-hover:scale-[1.05] sm:size-[50px] ${iconBackground} ${hoverBackground} ${iconColor}`}>
            {cloneElement(icon as ReactElement<{ size?: number; strokeWidth?: number }>, { size: 24, strokeWidth: 2 })}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <b className="text-[13px] font-semibold leading-snug text-indigo-950 sm:text-[14px]">{title}</b>
            <small className="text-[12px] font-medium leading-snug text-slate-600">{count}</small>
          </span>
          <ArrowRight aria-hidden="true" size={15} className="shrink-0 -translate-x-1 text-violet-600 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"/>
        </a>;
      })}
    </div>
  </section>;
}

export function SiteFooter() { return <footer className="mx-[18px] mt-8 max-w-[1396px] border-t border-slate-100 py-5 text-[11px] text-slate-400 lg:mx-auto">© 2025 HackRadar</footer>; }
