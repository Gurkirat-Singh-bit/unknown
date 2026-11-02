"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Code2,
  MapPin,
  Trophy,
  ArrowLeft,
  ChevronRight,
  Eye,
  Zap,
} from "lucide-react";
import { Navbar } from "@repo/ui";
import { SiteFooter } from "@repo/ui";

import { sampleEvents, listingEvents } from "../../../data/events";
import { slugify } from "../../../lib/slugify";

export function HackathonDetailsPage({ slug }: { slug: string }) {
  const event =
    listingEvents.find((item) => slugify(item.title) === slug) ??
    sampleEvents[0]!;
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Schedule", "Prizes", "Judges", "FAQs"];
  return (
    <main className="min-h-screen bg-canvas">
      <Navbar />
      <div className="mx-auto max-w-[1396px] px-5 py-5 sm:px-8 lg:px-10">
        <div className="mb-5 flex items-center gap-2 text-xs text-muted">
          <a href="/" className="transition hover:text-primary-strong">
            Home
          </a>
          <ChevronRight size={14} />
          <a
            href="/hackathons"
            className="transition hover:text-primary-strong"
          >
            Hackathons
          </a>
          <ChevronRight size={14} />
          <span className="truncate text-muted">{event.title}</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
          <div
            className={`relative isolate flex min-h-[280px] items-end overflow-hidden rounded-2xl bg-gradient-to-br p-7 text-white sm:min-h-[320px] sm:p-10 from-contrast via-primary-strong to-primary`}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(120deg,transparent_48%,rgba(255,255,255,.1)_49%,transparent_50%),radial-gradient(ellipse_at_85%_20%,rgba(255,255,255,.2),transparent_34%)]"
            />
            <div
              aria-hidden="true"
              className="absolute right-[-4rem] top-[-5rem] -z-10 size-72 rounded-full border border-white/15 shadow-[0_0_0_28px_rgba(255,255,255,.035),0_0_0_58px_rgba(255,255,255,.025)]"
            />
            <div className="relative max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-contrast/10 px-3 py-1.5 text-[11px] font-medium text-white">
                <span className="size-1.5 rounded-full bg-accent-soft" />
                {event.mode}
              </span>
              <h1 className="max-w-2xl font-display text-[2rem] font-bold leading-[1.08] tracking-[-.03em] sm:text-[2.8rem]">
                {event.title}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
                {event.tagline}
              </p>
            </div>
            <Code2
              aria-hidden="true"
              className="absolute right-8 top-8 hidden size-12 text-white/35 sm:block"
              strokeWidth={1.35}
            />
          </div>
          <section className="flex flex-col rounded-[18px] border border-line/80 bg-surface p-5 shadow-[0_8px_28px_-22px_rgba(15,23,42,.3)] sm:p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-ink">
                <span className="size-1.5 rounded-full bg-accent-soft" />
                {event.registrationStatus === "closed"
                  ? "Registration Closed"
                  : event.registrationStatus === "upcoming"
                    ? "Registration Soon"
                    : "Registration Open"}
              </span>
              {event.featured && (
                <span className="rounded-full border border-line bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-primary-strong">
                  ✦ Featured
                </span>
              )}
            </div>
            <h2 className="font-display text-[1.65rem] font-extrabold leading-tight tracking-[-.035em] text-ink">
              {event.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {event.desc || event.tagline}
            </p>
            <div className="my-5 grid grid-cols-2 gap-x-3 gap-y-4 border-y border-line py-4">
              <DetailMetric
                icon={<CalendarDays />}
                title={event.date}
                detail="Event dates"
              />
              <DetailMetric
                icon={<MapPin />}
                title={event.place}
                detail={
                  event.mode === "Online" ? "Virtual event" : "Event location"
                }
              />
              <DetailMetric
                icon={<Trophy />}
                title={event.prize}
                detail="Prize pool"
              />
            </div>
            <button
              disabled={event.registrationStatus === "closed"}
              className="mt-auto inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-[0_8px_18px_-8px_rgba(15,23,42,.65)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(15,23,42,.55)] active:translate-y-0 active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-line disabled:from-accent disabled:to-accent disabled:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {event.registrationStatus === "closed"
                ? "Registration Closed"
                : "Register Now"}
              <ArrowRight className="ml-2" size={16} />
            </button>
          </section>
        </div>
        <div
          role="tablist"
          aria-label="Event information"
          className="sticky top-0 z-20 -mx-5 mt-7 flex gap-1 overflow-x-auto border-b border-line bg-canvas/95 px-5 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              id={`event-tab-${slugify(tab)}`}
              aria-selected={activeTab === tab}
              aria-controls="event-panel"
              tabIndex={activeTab === tab ? 0 : -1}
              onKeyDown={(e) => {
                const i = tabs.indexOf(tab);
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next =
                    tabs[
                      (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
                        tabs.length
                    ]!;
                  setActiveTab(next);
                  document
                    .getElementById(`event-tab-${slugify(next)}`)
                    ?.focus();
                }
              }}
              onClick={() => setActiveTab(tab)}
              className={`relative min-h-12 shrink-0 px-4 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${activeTab === tab ? "text-primary-strong after:absolute after:right-3 after:bottom-0 after:left-3 after:h-[2px] after:rounded-full after:bg-primary" : "text-muted hover:text-ink"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid gap-7 py-7 lg:grid-cols-[minmax(0,1.65fr)_360px]">
          <article
            id="event-panel"
            role="tabpanel"
            aria-labelledby={`event-tab-${slugify(activeTab)}`}
            className="min-w-0 px-1 py-1 sm:px-2"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary-strong">
                <Code2 size={18} />
              </span>
              <h2 className="font-display text-[21px] font-bold tracking-[-.02em] text-ink">
                {activeTab === "Overview" ? "About the Event" : activeTab}
              </h2>
            </div>
            <p className="mt-4 max-w-[66ch] text-[15px] leading-7 text-muted">
              {event.desc || event.tagline}
            </p>
            {(event.category ||
              event.teamSize ||
              event.participants ||
              event.registrationDeadline) && (
              <div className="mt-7 border-t border-line pt-5">
                <h3 className="text-sm font-semibold text-ink">At a glance</h3>
                <dl className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {event.category && (
                    <div>
                      <dt className="text-xs text-muted">Category</dt>
                      <dd className="mt-1 text-sm font-medium text-ink">
                        {event.category}
                      </dd>
                    </div>
                  )}
                  {event.teamSize && (
                    <div>
                      <dt className="text-xs text-muted">Team size</dt>
                      <dd className="mt-1 text-sm font-medium text-ink">
                        {event.teamSize}
                      </dd>
                    </div>
                  )}
                  {event.participants != null && (
                    <div>
                      <dt className="text-xs text-muted">Participants</dt>
                      <dd className="mt-1 text-sm font-medium text-ink">
                        {event.participants.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {event.registrationDeadline && (
                    <div>
                      <dt className="text-xs text-muted">
                        Registration deadline
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-ink">
                        {event.registrationDeadline}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </article>
          <aside className="space-y-3 lg:sticky lg:top-16 lg:self-start">
            <section className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-[0_18px_45px_-28px_rgba(15,23,42,.38)]">
              <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary-strong via-contrast to-contrast px-5 py-5 text-white">
                <div
                  aria-hidden="true"
                  className="absolute -right-9 -top-12 -z-10 size-40 rounded-full border border-white/15 shadow-[0_0_0_18px_rgba(255,255,255,.06),0_0_0_38px_rgba(255,255,255,.04)]"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-contrast/25 text-white shadow-inner shadow-white/10">
                    <CalendarDays size={23} strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15px] font-extrabold leading-tight">
                      Event details
                    </span>
                    <span className="mt-1 block text-[10px] text-brand-soft">
                      Your event at a glance
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-surface/15 px-2 py-1 text-[10px] font-semibold">
                    <Eye size={12} />
                    Overview
                  </span>
                </div>
              </div>
              <div className="px-5 py-2">
                {[
                  { Icon: CalendarDays, label: "Dates", value: event.date },
                  { Icon: Zap, label: "Mode", value: event.mode },
                  { Icon: Trophy, label: "Prize pool", value: event.prize },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex min-h-[67px] items-center gap-3 border-b border-line/80 py-3 last:border-0"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-soft to-brand-soft text-primary-strong">
                      <Icon size={19} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-medium text-muted">
                        {label}
                      </span>
                      <span className="mt-0.5 block break-words text-[13px] font-bold leading-5 text-ink">
                        {value}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mx-3 mb-3 flex items-center gap-3 rounded-[18px] sm:mx-5 sm:px-5 bg-gradient-to-r from-brand-soft via-brand-soft to-brand-soft px-3 py-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-strong to-contrast text-lg font-extrabold text-white shadow-[0_5px_16px_rgba(15,23,42,.32)] ring-4 ring-white">
                  {(event.organizer ?? event.category ?? "H")
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] text-primary-strong">
                    Organized by
                  </span>
                  <span className="block truncate text-[13px] font-extrabold text-ink">
                    {event.organizer ?? event.category ?? "HackRadar Community"}
                  </span>
                </span>
              </div>
            </section>
            <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[14px] font-bold text-ink">
                  Share this event
                </h3>
                <span className="text-xs text-muted">Share</span>
              </div>
              <div className="mt-4 flex gap-2.5">
                {[
                  {
                    name: "X",
                    color: "text-[#111827]",
                    path: "M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.4l7.3-8.4L1.9 2h6.5l4.5 6.9L18.9 2Zm-1.1 18h1.7L7.4 3.9H5.6L17.8 20Z",
                  },
                  {
                    name: "LinkedIn",
                    color: "text-[#0A66C2]",
                    path: "M19 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4 9h4v12H4V9Zm6 0h3.8v1.6h.1c.5-.9 1.7-1.9 3.6-1.9 3.9 0 4.6 2.4 4.6 5.5V21h-4v-6c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21h-4V9ZM4 3h4v4H4V3Z",
                  },
                  {
                    name: "Facebook",
                    color: "text-[#1877F2]",
                    path: "M13.5 22v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V14h2.8v8h3.4Z",
                  },
                ].map(({ name, color, path }) => (
                  <button
                    key={name}
                    type="button"
                    aria-label={`Share via ${name}`}
                    className={`grid size-10 place-items-center rounded-xl border border-line bg-surface ${color} transition duration-150 hover:-translate-y-0.5 hover:border-line hover:bg-canvas active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-[18px] fill-current"
                    >
                      <path d={path} />
                    </svg>
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Copy event link"
                  onClick={() => {
                    void navigator.clipboard?.writeText(window.location.href);
                  }}
                  className="grid size-10 place-items-center rounded-xl border border-line bg-surface text-muted transition duration-150 hover:-translate-y-0.5 hover:border-line hover:bg-canvas active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>
          </aside>
        </div>
        <a
          href="/hackathons"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-strong transition hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft size={16} /> Back to hackathons
        </a>
      </div>
      <SiteFooter />
    </main>
  );
}

function DetailMetric({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex min-w-0 gap-2.5">
      <span className="mt-0.5 shrink-0 text-primary-strong [&>svg]:size-[17px] [&>svg]:stroke-[1.8]">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="break-words text-[11px] font-bold leading-4 text-ink">
          {title}
        </div>
        <div className="mt-0.5 text-[11px] text-muted">{detail}</div>
      </div>
    </div>
  );
}
