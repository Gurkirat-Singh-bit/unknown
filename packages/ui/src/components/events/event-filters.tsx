"use client";

import { type ReactNode } from "react";
import { Globe2, LayoutGrid, MapPin, Monitor } from "lucide-react";
import type { EventMode } from "../../types/event";

export function EventFilters({
  mode,
  onChange,
}: {
  mode: EventMode;
  onChange: (mode: EventMode) => void;
}) {
  const options: [EventMode, ReactNode][] = [
    ["All", <LayoutGrid size={17} strokeWidth={2} key="grid" />],
    ["Online", <Monitor size={17} strokeWidth={2} key="monitor" />],
    ["In-person", <MapPin size={17} strokeWidth={2} key="pin" />],
    ["Hybrid", <Globe2 size={17} strokeWidth={2} key="globe" />],
  ];
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
    );
    const currentIndex = buttons.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    if (currentIndex < 0) return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (currentIndex +
              (event.key === "ArrowRight" ? 1 : -1) +
              buttons.length) %
            buttons.length;
    buttons[nextIndex]?.focus();
    buttons[nextIndex]?.click();
  };

  return (
    <div
      className="mx-auto mt-3 w-full max-w-[560px] px-1"
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="Filter events by format"
    >
      <div className="flex flex-wrap justify-center gap-2">
        {options.map(([label, icon]) => {
          const active = mode === label;
          return (
            <button
              type="button"
              key={label}
              aria-pressed={active}
              onClick={() => onChange(label)}
              className={`inline-flex h-11 min-w-[82px] shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-[13px] tracking-[-0.05px] transition duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:active:scale-100 ${active ? "border-primary bg-primary font-semibold text-on-primary shadow-[0_4px_12px_rgba(15,23,42,0.24)] hover:brightness-105" : "border-line bg-surface font-medium text-muted hover:border-line hover:bg-brand-soft"}`}
            >
              <span className={active ? "text-on-primary" : "text-ink"}>
                {icon}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
