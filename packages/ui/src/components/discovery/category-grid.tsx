"use client";

import { cloneElement, type ReactElement, type ReactNode } from "react";
import {
  ArrowRight,
  Code2,
  Globe2,
  Lightbulb,
  Trophy,
  Users,
  UsersRound,
  Video,
} from "lucide-react";

const categories: {
  icon: ReactNode;
  title: string;
  count: string;
  iconColor: string;
  iconBackground: string;
  hoverBackground: string;
  accent: string;
}[] = [
  {
    icon: <Trophy />,
    title: "Hackathons",
    count: "1,200+ events",
    iconColor: "text-primary-strong",
    iconBackground: "bg-brand-soft",
    hoverBackground: "group-hover:bg-brand-soft",
    accent: "bg-primary",
  },
  {
    icon: <UsersRound />,
    title: "Developer Meetups",
    count: "800+ events",
    iconColor: "text-ink",
    iconBackground: "bg-accent-soft",
    hoverBackground: "group-hover:bg-accent-soft",
    accent: "bg-accent-soft",
  },
  {
    icon: <Code2 />,
    title: "Coding Competitions",
    count: "500+ events",
    iconColor: "text-primary-strong",
    iconBackground: "bg-brand-soft",
    hoverBackground: "group-hover:bg-brand-soft",
    accent: "bg-primary",
  },
  {
    icon: <Lightbulb />,
    title: "Workshops",
    count: "300+ events",
    iconColor: "text-ink",
    iconBackground: "bg-brand-soft",
    hoverBackground: "group-hover:bg-brand-soft",
    accent: "bg-accent",
  },
  {
    icon: <Video />,
    title: "Online Events",
    count: "1,000+ events",
    iconColor: "text-ink",
    iconBackground: "bg-brand-soft",
    hoverBackground: "group-hover:bg-brand-soft",
    accent: "bg-accent",
  },
  {
    icon: <Users />,
    title: "Communities",
    count: "50+ communities",
    iconColor: "text-ink",
    iconBackground: "bg-accent-soft",
    hoverBackground: "group-hover:bg-accent-soft",
    accent: "bg-accent-soft",
  },
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
      className="mx-auto w-full max-w-site px-4 pt-8 sm:px-6 lg:px-8"
      id="categories"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 sm:mb-5">
        <div>
          <h2 className="flex items-center gap-2.5 font-display text-[18px] font-extrabold tracking-tight text-ink sm:gap-3 sm:text-xl">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-white">
              <Globe2 size={14} strokeWidth={2} />
            </span>
            Explore by Category
          </h2>
          <p className="mt-1.5 ml-[34px] max-w-[290px] text-[12px] leading-relaxed text-muted sm:max-w-none sm:text-[13px]">
            Find the perfect event, community, or opportunity that matches your
            goals.
          </p>
        </div>
        <a
          className="group inline-flex shrink-0 items-center gap-1.5 pt-1.5 text-[12px] font-semibold text-primary-strong transition-colors hover:text-primary-strong focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-[13px]"
          href="#categories"
        >
          View All{" "}
          <ArrowRight
            size={15}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </a>
      </div>
      <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 2xl:gap-4">
        {categories.map(
          ({
            icon,
            title,
            count,
            iconColor,
            iconBackground,
            hoverBackground,
            accent,
          }) => {
            const isActive = activeCategory === title;
            return (
              <a
                href="#hackathons"
                key={title}
                aria-label={`${title}, ${count}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelectCategory?.(title)}
                className={`group relative flex min-h-[88px] items-center gap-3 overflow-hidden rounded-[14px] border bg-surface px-3.5 py-3.5 transition-all duration-200 ease-out hover:-translate-y-[3px] hover:border-line hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-[96px] sm:gap-3.5 sm:px-4 ${isActive ? "border-line shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" : "border-line"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 ${accent} ${isActive ? "opacity-100" : ""}`}
                />
                <span
                  aria-hidden="true"
                  className={`grid size-12 shrink-0 place-items-center rounded-[14px] transition duration-200 group-hover:scale-[1.05] sm:size-[50px] ${iconBackground} ${hoverBackground} ${iconColor}`}
                >
                  {cloneElement(
                    icon as ReactElement<{
                      size?: number;
                      strokeWidth?: number;
                    }>,
                    { size: 24, strokeWidth: 2 },
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <b className="text-[13px] font-semibold leading-snug text-ink sm:text-[14px]">
                    {title}
                  </b>
                  <small className="text-[12px] font-medium leading-snug text-muted">
                    {count}
                  </small>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  size={15}
                  className="shrink-0 -translate-x-1 text-primary-strong opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                />
              </a>
            );
          },
        )}
      </div>
    </section>
  );
}
