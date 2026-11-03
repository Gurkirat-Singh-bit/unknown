"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CaretDownIcon as ChevronDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { ListIcon as Menu } from "@phosphor-icons/react/dist/csr/List";
import { XIcon as X } from "@phosphor-icons/react/dist/csr/X";
import { SearchIcon } from "../search/search-icon";

export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const menuRefs = useRef(new Map<string, HTMLDivElement>());
  const menuTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const focusMenuItem = (
    key: string,
    direction: "first" | "last" = "first",
  ) => {
    const links = menuRefs.current
      .get(key)
      ?.querySelectorAll<HTMLAnchorElement>("a[role='menuitem']");
    if (!links?.length) return;
    (direction === "first" ? links[0] : links[links.length - 1])?.focus();
  };

  const navItems = [
    { key: "hackathons", label: "Hackathons", href: "#hackathons" },
    {
      key: "solutions",
      label: "Solutions",
      href: "#categories",
      submenu: [
        { label: "Browse Hackathons", href: "#hackathons" },
        { label: "Explore Categories", href: "#categories" },
      ],
    },
    {
      key: "vibecoding",
      label: "VibeCoding",
      href: "#vibecoding",
      badge: "New",
    },
    {
      key: "resources",
      label: "Resources",
      href: "#resources",
      submenu: [
        { label: "Developer Resources", href: "#resources" },
        { label: "Workshops & Events", href: "#categories" },
      ],
    },
    {
      key: "communities",
      label: "Communities",
      href: "#communities",
      submenu: [
        { label: "Developer Communities", href: "#communities" },
        { label: "Developer Meetups", href: "#categories" },
      ],
    },
  ];

  const closeDesktopMenus = () => {
    setOpenMenu(null);
  };
  const handleNavKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    setOpenMenu(null);
    setMobileOpen(false);
    if (openMenu) menuTriggerRefs.current.get(openMenu)?.focus();
    else if (mobileOpen) mobileTriggerRef.current?.focus();
  };

  return (
    <header
      ref={headerRef}
      onKeyDown={handleNavKeyDown}
      className="relative z-50 h-header border-b border-line bg-white shadow-[0_4px_20px_rgba(15,23,42,0.045)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full w-full max-w-site items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a
          className="flex shrink-0 items-center gap-2.5 font-display text-[19px] font-extrabold tracking-[-0.6px] text-ink sm:gap-3"
          href="/"
          aria-label="HackRadar home"
        >
          <span className="grid size-[30px] place-items-center rounded-[9px] rounded-bl-sm bg-lime text-[23px] leading-none text-black shadow-sm">
            h
          </span>
          <span>HackRadar</span>
        </a>

        <nav
          aria-label="Main navigation"
          onPointerLeave={closeDesktopMenus}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              closeDesktopMenus();
          }}
          className="relative hidden h-11 items-center gap-1 text-[13px] font-medium tracking-[-0.1px] text-black/70 xl:flex"
        >
          {navItems.map((item) => (
            <div
              key={item.key}
              onPointerEnter={() => {
                setOpenMenu(item.submenu ? item.key : null);
              }}
              onFocusCapture={() => {
                if (item.submenu) setOpenMenu(item.key);
              }}
              className="relative z-10 flex h-full shrink-0 items-center"
            >
              <a
                href={item.href}
                aria-current={item.key === "hackathons" ? "page" : undefined}
                className={`relative flex h-9 items-center gap-1.5 rounded-lg px-3 whitespace-nowrap outline-none transition-colors duration-200 focus-visible:text-lime-ink ${item.key === "hackathons" ? "font-semibold text-lime-ink" : "hover:text-lime-ink"}`}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-0.5 rounded-full bg-brand-soft/90 px-2 py-0.5 text-[9px] leading-none font-semibold text-lime-ink">
                    {item.badge}
                  </span>
                )}
              </a>
              {item.submenu && (
                <button
                  ref={(node) => {
                    if (node) menuTriggerRefs.current.set(item.key, node);
                    else menuTriggerRefs.current.delete(item.key);
                  }}
                  type="button"
                  aria-label={`Open ${item.label} menu`}
                  aria-haspopup="menu"
                  aria-expanded={openMenu === item.key}
                  aria-controls={`nav-menu-${item.key}`}
                  onClick={() => setOpenMenu(item.key)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setOpenMenu(item.key);
                      requestAnimationFrame(() => focusMenuItem(item.key));
                    }
                  }}
                  className="mr-2 grid size-6 place-items-center rounded-md text-black/70 outline-none transition hover:text-lime-ink focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 motion-reduce:transition-none ${openMenu === item.key ? "rotate-180" : ""}`}
                  />
                </button>
              )}
              {item.submenu && (
                <div
                  className={`absolute top-full left-1/2 z-50 w-60 -translate-x-1/2 pt-2 transition-colors duration-200 ease-out motion-reduce:transition-none ${openMenu === item.key ? "visible opacity-100" : "invisible opacity-0"}`}
                >
                  <div
                    ref={(node) => {
                      if (node) menuRefs.current.set(item.key, node);
                      else menuRefs.current.delete(item.key);
                    }}
                    id={`nav-menu-${item.key}`}
                    role="menu"
                    aria-label={`${item.label} links`}
                    onKeyDown={(event) => {
                      if (
                        event.key === "ArrowDown" ||
                        event.key === "ArrowUp"
                      ) {
                        event.preventDefault();
                        const links = Array.from(
                          event.currentTarget.querySelectorAll<HTMLAnchorElement>(
                            "a[role='menuitem']",
                          ),
                        );
                        const current = links.indexOf(
                          document.activeElement as HTMLAnchorElement,
                        );
                        const step = event.key === "ArrowDown" ? 1 : -1;
                        links[
                          (current + step + links.length) % links.length
                        ]?.focus();
                      } else if (event.key === "Home" || event.key === "End") {
                        event.preventDefault();
                        focusMenuItem(
                          item.key,
                          event.key === "Home" ? "first" : "last",
                        );
                      }
                    }}
                    className="rounded-2xl border border-black/20 bg-surface/95 p-2 shadow-xl backdrop-blur-xl"
                  >
                    {item.submenu.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        role="menuitem"
                        onClick={() => {
                          setOpenMenu(null);
                        }}
                        className="group/menu flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium text-black/70 outline-none transition-colors hover:bg-lime-soft hover:text-lime-ink focus-visible:bg-brand-soft focus-visible:text-lime-ink"
                      >
                        {link.label}
                        <ArrowRight
                          size={14}
                          className="text-lime-ink opacity-0 transition group-hover/menu:translate-x-0.5 group-hover/menu:opacity-100 group-focus-visible/menu:opacity-100"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-4 lg:gap-3 xl:gap-4">
          <button
            className="group grid size-9 place-items-center rounded-full text-black/70 transition hover:bg-lime-soft hover:text-lime-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Focus search"
            onClick={() => document.getElementById("search")?.focus()}
          >
            <SearchIcon className="size-[19px] transition-transform duration-200 group-hover:scale-110" />
          </button>
          <div className="hidden items-center gap-3 xl:flex">
            <button className="rounded-xl bg-lime px-3 py-2.5 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-lime-soft hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none xl:px-5">
              Organize a Hackathon
            </button>
          </div>
          <button
            ref={mobileTriggerRef}
            type="button"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((current) => !current)}
            className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-black/70 transition hover:bg-lime-soft hover:text-lime-ink focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none xl:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute top-[calc(100%+8px)] right-3 left-3 z-50 rounded-2xl border border-line bg-surface/95 p-3 shadow-xl backdrop-blur-xl max-h-[calc(100dvh-6rem)] overflow-y-auto xl:hidden sm:right-6 sm:left-6"
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.key}>
                <div className="flex items-center rounded-xl transition-colors hover:bg-lime-soft">
                  <a
                    href={item.href}
                    aria-current={
                      item.key === "hackathons" ? "page" : undefined
                    }
                    onClick={() => setMobileOpen(false)}
                    className={`flex min-h-11 flex-1 items-center gap-2 px-3 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${item.key === "hackathons" ? "font-semibold text-lime-ink" : "text-black/70"}`}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="rounded-full bg-brand-soft px-2 py-1 text-[10px] leading-none font-semibold text-lime-ink">
                        {item.badge}
                      </span>
                    )}
                  </a>
                  {item.submenu && (
                    <button
                      type="button"
                      aria-label={`Expand ${item.label} links`}
                      aria-expanded={mobileExpanded === item.key}
                      onClick={() =>
                        setMobileExpanded((current) =>
                          current === item.key ? null : item.key,
                        )
                      }
                      className="mr-1 grid size-9 place-items-center rounded-lg text-black/70 transition hover:text-lime-ink focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 motion-reduce:transition-none ${mobileExpanded === item.key ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {item.submenu && mobileExpanded === item.key && (
                  <div className="ml-4 border-l border-line py-1 pl-3">
                    {item.submenu.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-10 items-center justify-between rounded-lg px-3 text-[13px] text-black/70 transition-colors hover:bg-lime-soft hover:text-lime-ink focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        {link.label}
                        <ArrowRight size={14} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 border-t border-line pt-3">
            <button className="rounded-xl bg-lime px-3 py-2.5 text-[13px] font-semibold text-black shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-primary">
              Organize a Hackathon
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
