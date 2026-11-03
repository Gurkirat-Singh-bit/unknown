"use client";

import { useEffect, useRef, useState } from "react";
import { CircleNotchIcon as LoaderCircle } from "@phosphor-icons/react/dist/csr/CircleNotch";
import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon as X } from "@phosphor-icons/react/dist/csr/X";
import { SearchIcon } from "./search-icon";

const popularSearches = [
  "Artificial Intelligence",
  "Web3",
  "React",
  "Open Source",
  "Hackathons in India",
];
export type SearchHandler = (value: string) => void | Promise<unknown>;

export function SearchBar({
  onSearch,
  resultCount,
  submittedQuery = "",
  loading = false,
  disabled = false,
}: {
  onSearch: SearchHandler;
  resultCount?: number;
  submittedQuery?: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPending, setIsPending] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = loading || isPending;
  const normalizedQuery = query.trim();
  const filteredSuggestions = popularSearches.filter((suggestion) =>
    suggestion.toLowerCase().includes(normalizedQuery.toLowerCase()),
  );
  const hasNoResults = Boolean(
    normalizedQuery && submittedQuery === normalizedQuery && resultCount === 0,
  );
  const visibleSuggestions = hasNoResults
    ? popularSearches.map((suggestion) => ({
        label: suggestion,
        value: suggestion,
      }))
    : filteredSuggestions.length > 0
      ? filteredSuggestions.map((suggestion) => ({
          label: suggestion,
          value: suggestion,
        }))
      : normalizedQuery
        ? [{ label: `Search for “${normalizedQuery}”`, value: normalizedQuery }]
        : [];

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
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
        void Promise.resolve(result)
          .catch(() => {
            setSearchError(true);
            setIsOpen(true);
          })
          .finally(() => setIsPending(false));
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
      setActiveIndex((current) =>
        Math.min(current + 1, visibleSuggestions.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, -1));
    } else if (
      event.key === "Enter" &&
      activeIndex >= 0 &&
      visibleSuggestions[activeIndex]
    ) {
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

  return (
    <div ref={searchRef} className="relative z-20 mx-auto w-full max-w-[560px]">
      <form
        aria-busy={isLoading}
        onSubmit={handleSubmit}
        className="flex h-14 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 shadow-[0_5px_20px_rgba(15,23,42,0.07)] transition duration-200 hover:border-line focus-within:border-primary focus-within:ring-4 focus-within:ring-accent sm:px-5"
      >
        <SearchIcon className="size-5 shrink-0" />
        <input
          ref={inputRef}
          id="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && !disabled}
          aria-controls="hackradar-search-suggestions"
          aria-activedescendant={
            activeIndex >= 0
              ? `hackradar-search-option-${activeIndex}`
              : undefined
          }
          value={query}
          disabled={disabled || isLoading}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
            setSearchError(false);
          }}
          placeholder="Search hackathons, events, technologies..."
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted transition placeholder:transition-colors focus:placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
        />
        {query && !isLoading && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clearSearch}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-muted focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={17} />
          </button>
        )}
        <button
          type="submit"
          disabled={disabled || isLoading}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-on-primary transition duration-200 hover:bg-accent active:scale-[0.98] active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-accent disabled:active:scale-100 sm:px-5"
        >
          {isLoading ? (
            <>
              <LoaderCircle
                size={16}
                className="animate-spin motion-reduce:animate-none"
              />
              Searching
            </>
          ) : (
            "Search"
          )}
        </button>
      </form>

      {isOpen && !disabled && (
        <div
          id="hackradar-search-suggestions"
          role="presentation"
          className="absolute top-[calc(100%+8px)] right-0 left-0 max-h-72 overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-xl shadow-contrast/10"
        >
          {isLoading ? (
            <p
              role="status"
              className="flex items-center gap-2 px-3 py-3 text-sm text-muted"
            >
              <LoaderCircle
                size={16}
                className="animate-spin text-primary-strong motion-reduce:animate-none"
              />
              Searching events…
            </p>
          ) : searchError ? (
            <p role="status" className="px-3 py-3 text-sm text-primary-strong">
              Search couldn’t be completed. Please try again.
            </p>
          ) : (
            isOpen && (
              <>
                {hasNoResults && (
                  <div role="status" className="px-3 pb-2 pt-1">
                    <p className="text-sm font-semibold text-ink">
                      No matching events found
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Try another keyword or browse a popular search.
                    </p>
                  </div>
                )}
                <p className="px-3 pb-2 pt-1 text-[10px] font-bold tracking-[0.12em] text-muted uppercase">
                  {normalizedQuery && !hasNoResults
                    ? "Suggestions"
                    : "Popular searches"}
                </p>
                <ul
                  role="listbox"
                  aria-label={
                    normalizedQuery && !hasNoResults
                      ? "Search suggestions"
                      : "Popular searches"
                  }
                >
                  {visibleSuggestions.map((suggestion, index) => (
                    <li
                      id={`hackradar-search-option-${index}`}
                      key={suggestion.value}
                      role="option"
                      aria-selected={activeIndex === index}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => runSearch(suggestion.value)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${activeIndex === index ? "bg-brand-soft text-primary-strong" : "text-muted hover:bg-canvas"}`}
                    >
                      <Search size={15} className="shrink-0 text-muted" />
                      {suggestion.label}
                    </li>
                  ))}
                </ul>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
