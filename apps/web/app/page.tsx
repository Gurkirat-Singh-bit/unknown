"use client";

import { useMemo, useState } from "react";
import { CategoryGrid, EventMode, HeroSection, Navbar, sampleEvents, SiteFooter, TrendingSection } from "@repo/ui";

export default function Home() {
  const [mode, setMode] = useState<EventMode>("All");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const events = useMemo(() => sampleEvents.filter((event) => {
    const matchesMode = mode === "All" || event.mode === mode;
    const matchesCategory = !categoryFilter || (categoryFilter === "Online Events" ? event.mode === "Online" : event.category?.toLowerCase() === categoryFilter.toLowerCase());
    const matchesSearch = !search || `${event.title} ${event.desc} ${event.place}`.toLowerCase().includes(search.toLowerCase());
    return matchesMode && matchesCategory && matchesSearch;
  }), [mode, categoryFilter, search]);
  const selectCategory = (category: string) => {
    setCategoryFilter(category);
    setMode("All");
  };
  const selectMode = (nextMode: EventMode) => {
    setMode(nextMode);
    setCategoryFilter(null);
  };
  return <main><Navbar/><HeroSection mode={mode} onModeChange={selectMode} onSearch={setSearch} resultCount={events.length} submittedQuery={search}/><TrendingSection events={events}/><CategoryGrid activeCategory={categoryFilter} onSelectCategory={selectCategory}/><SiteFooter/></main>;
}
