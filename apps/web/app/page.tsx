"use client";

import { useMemo, useState } from "react";
import { sampleEvents } from "../data/events";
import {
  CategoryGrid,
  HeroSection,
  Navbar,
  SiteFooter,
  TrendingSection,
} from "@repo/ui";

export default function Home() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const events = useMemo(
    () =>
      sampleEvents.filter((event) => {
        const matchesCategory =
          !categoryFilter ||
          (categoryFilter === "Online Events"
            ? event.mode === "Online"
            : event.category?.toLowerCase() === categoryFilter.toLowerCase());
        const matchesSearch =
          !search ||
          `${event.title} ${event.desc} ${event.place}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [categoryFilter, search],
  );
  const selectCategory = (category: string) => {
    setCategoryFilter(category);
  };
  return (
    <main>
      <Navbar />
      <HeroSection
        onSearch={setSearch}
        resultCount={events.length}
        submittedQuery={search}
      />
      <TrendingSection events={events} />
      <CategoryGrid
        activeCategory={categoryFilter}
        onSelectCategory={selectCategory}
      />
      <SiteFooter />
    </main>
  );
}
