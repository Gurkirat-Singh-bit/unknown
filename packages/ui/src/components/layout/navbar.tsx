"use client";

import { useState } from "react";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

const links = [
  { label: "Hackathons", href: "/hackathons" },
  { label: "Online events", href: "/hackathons?mode=online" },
  { label: "About", href: "/about" },
];
export function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="relative z-50 h-header border-b border-line bg-surface">
    <div className="mx-auto flex h-full max-w-site items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
      <a href="/" aria-label="HackRadar home" className="flex shrink-0 items-center gap-2.5 font-display text-[19px] font-extrabold tracking-[-0.6px] text-ink sm:gap-3">
        <span aria-hidden="true" className="grid size-[30px] place-items-center rounded-[9px] rounded-bl-sm bg-lime text-[23px] leading-none text-black shadow-sm">h</span>
        <span>HackRadar</span>
      </a>
      <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">{links.map((link) => <a key={link.href} href={link.href} className="text-sm font-semibold text-muted transition hover:text-ink">{link.label}</a>)}</nav>
      <a href="/hackathons" className="ml-auto hidden rounded-full bg-ink px-5 py-3 text-xs font-semibold text-white transition hover:bg-primary md:block md:ml-0">Find a hackathon <span aria-hidden="true" className="ml-3 text-lime">↗</span></a>
      <button type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" className="grid size-11 place-items-center rounded-xl border border-line md:hidden">{open ? <XIcon size={21} /> : <ListIcon size={21} />}</button>
    </div>
    {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full border-b border-line bg-surface p-4 shadow-lg md:hidden">{links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-canvas">{link.label}</a>)}</nav>}
  </header>;
}
