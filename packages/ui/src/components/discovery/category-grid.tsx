"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { CodeIcon } from "@phosphor-icons/react/dist/csr/Code";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/csr/GlobeHemisphereWest";
import { LightbulbIcon } from "@phosphor-icons/react/dist/csr/Lightbulb";
import { TrophyIcon } from "@phosphor-icons/react/dist/csr/Trophy";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";

const categories = [
  { icon: TrophyIcon, title: "Hackathons", count: "1,200+ events" },
  { icon: UsersIcon, title: "Developer Meetups", count: "800+ events" },
  { icon: CodeIcon, title: "Coding Competitions", count: "500+ events" },
  { icon: LightbulbIcon, title: "Workshops", count: "300+ events" },
  {
    icon: GlobeHemisphereWestIcon,
    title: "Online Events",
    count: "1,000+ events",
  },
  { icon: UsersThreeIcon, title: "Communities", count: "50+ communities" },
];

export function CategoryGrid({
  onSelectCategory,
  activeCategory = null,
}: {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string | null;
}) {
  return (
    <section
      id="categories"
      className="relative mx-auto mt-12 w-full max-w-site scroll-mt-8 border-t border-ink/20 px-4 pt-10 pb-14 sm:mt-16 sm:px-6 lg:px-8"
    >
      <div className="mb-7 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Categories
        </h2>
      </div>
      <div className="grid gap-x-10 lg:grid-cols-2">
        {categories.map(({ icon: Icon, title, count }) => {
          const active = activeCategory === title;
          return (
            <a
              key={title}
              id={`category-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              href="#hackathons"
              aria-current={active ? "true" : undefined}
              aria-label={`${title}, ${count}`}
              onClick={() => onSelectCategory?.(title)}
              className={`flex min-h-24 items-center gap-4 border-t px-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-ink sm:gap-5 ${active ? "border-ink bg-lime-soft" : "border-line hover:bg-lime-soft/50"}`}
            >
              <Icon size={25} weight="light" className="shrink-0 text-ink" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink sm:text-base">
                  {title}
                </span>
                <span className="mt-1 block text-[11px] text-muted">
                  {count}
                </span>
              </span>
              <ArrowUpRightIcon
                size={20}
                weight="light"
                className="shrink-0 text-ink"
              />
            </a>
          );
        })}
      </div>
    </section>
  );
}
