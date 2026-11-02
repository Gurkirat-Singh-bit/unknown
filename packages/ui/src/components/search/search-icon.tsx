"use client";

import { Search } from "lucide-react";

export function SearchIcon({
  className = "size-full",
}: {
  className?: string;
}) {
  return (
    <Search
      aria-hidden="true"
      className={`${className} stroke-muted`}
      strokeWidth={1.8}
    />
  );
}
