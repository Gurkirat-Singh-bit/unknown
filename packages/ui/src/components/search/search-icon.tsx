"use client";

import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

export function SearchIcon({
  className = "size-full",
}: {
  className?: string;
}) {
  return <Search aria-hidden="true" className={className} weight="regular" />;
}
