"use client";

import { useId } from "react";
import type { EventMode } from "../../types/event";

const options: { value: EventMode; label: string }[] = [
  { value: "All", label: "All events" },
  { value: "Online", label: "Online" },
  { value: "In-person", label: "In person" },
  { value: "Hybrid", label: "Hybrid" },
];

export function EventFilters({
  mode,
  onChange,
}: {
  mode: EventMode;
  onChange: (mode: EventMode) => void;
}) {
  const name = useId();
  return (
    <fieldset className="mx-auto mt-4 w-full max-w-sm">
      <legend className="sr-only">Filter events by format</legend>
      <div className="grid grid-cols-4 border-b border-ink/10">
        {options.map(({ value, label }) => (
          <label
            key={value}
            className="relative min-w-0 cursor-pointer text-center text-[11px] sm:text-xs"
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={mode === value}
              onChange={() => onChange(value)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center whitespace-nowrap border-b-2 border-transparent px-1 text-muted transition-colors hover:text-ink peer-checked:border-lime peer-checked:font-semibold peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
