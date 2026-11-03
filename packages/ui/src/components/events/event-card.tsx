"use client";

import { type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Code2,
  Globe2,
  MapPin,
  Monitor,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import type { EventMode, Hackathon } from "../../types/event";

const coverStyle: Record<string, string> = {
  summit:
    "bg-linear-to-br from-primary-strong via-poster-mid to-contrast before:bg-[repeating-linear-gradient(60deg,transparent_0_36px,#ffffff10_37px_44px)]",
  ai: "bg-linear-to-br from-contrast via-poster-night to-poster-mid after:bg-[radial-gradient(ellipse_at_90%_80%,var(--color-primary),transparent_50%)]",
  opensource:
    "bg-linear-to-br from-brand-soft via-white to-accent-soft before:bg-[repeating-linear-gradient(130deg,transparent_0_30px,#b9ed3214_32px_48px)]",
  bangalore: "bg-linear-to-b from-contrast via-poster-mid to-lime",
  web3: "bg-linear-to-br from-yellow via-lime-soft to-cyan before:bg-[radial-gradient(circle_at_85%_75%,var(--color-primary-strong)_0_12%,transparent_13%),radial-gradient(circle_at_70%_20%,#ffffff99_0_6%,transparent_7%),repeating-linear-gradient(130deg,transparent_0_29px,#ffffff40_30px_42px)]",
};

const modeBadgeStyles: Record<Exclude<EventMode, "All">, string> = {
  Online: "bg-cyan text-on-cyan",
  "In-person": "bg-primary text-on-primary",
  Hybrid: "bg-cyan text-on-cyan",
};

export function EventCard({
  event,
  onSelect,
}: {
  event: Hackathon;
  onSelect?: (event: Hackathon) => void;
}) {
  const interactive = Boolean(event.href || onSelect);
  const card = (
    <article
      role={!event.href && onSelect ? "button" : undefined}
      tabIndex={!event.href && onSelect ? 0 : undefined}
      aria-label={
        !event.href && onSelect ? `View details for ${event.title}` : undefined
      }
      onClick={!event.href && onSelect ? () => onSelect(event) : undefined}
      onKeyDown={
        !event.href && onSelect
          ? (keyEvent) => {
              if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                keyEvent.preventDefault();
                onSelect(event);
              }
            }
          : undefined
      }
      className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-[0_2px_10px_rgba(15,23,42,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${interactive ? "cursor-pointer" : ""}`}
    >
      <div className="relative isolate aspect-[1.9/1] max-h-[220px] min-h-[180px] w-full shrink-0 overflow-hidden bg-ink">
        <div
          className={`absolute inset-0 before:pointer-events-none before:absolute before:inset-0 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:content-[''] ${coverStyle[event.theme] ?? coverStyle.summit}`}
        />
        <div className="absolute inset-0">
          <PosterArtwork theme={event.theme} />
        </div>
        <div className="absolute inset-x-0 top-0 z-[2] flex items-center justify-between gap-2 p-4 sm:p-5">
          <span
            className={`max-w-[65%] truncate rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] ${event.theme === "opensource" ? "bg-brand-soft/90 text-ink" : event.theme === "web3" ? "bg-ink/10 text-ink" : "border border-white/25 bg-ink/15 text-white backdrop-blur-sm"}`}
          >
            {event.organizer ?? event.category ?? "HACKATHON"}
          </span>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold shadow-sm ${modeBadgeStyles[event.mode]}`}
          >
            {event.mode === "In-person" ? (
              <MapPin size={14} strokeWidth={2} />
            ) : event.mode === "Hybrid" ? (
              <Globe2 size={14} strokeWidth={2} />
            ) : (
              <Monitor size={14} strokeWidth={2} />
            )}{" "}
            {event.mode}
          </span>
        </div>
        <div
          className={`absolute inset-x-4 top-[48px] z-[2] max-w-[78%] font-display text-[22px] leading-[1.05] font-extrabold tracking-[-0.6px] sm:inset-x-5 sm:top-[52px] sm:text-[25px] ${event.theme === "opensource" ? "max-w-[70%] text-ink" : event.theme === "web3" ? "max-w-[72%] text-ink" : "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"}`}
        >
          {event.title}
        </div>
        <div
          className={`absolute inset-x-4 bottom-4 z-[2] line-clamp-1 max-w-[75%] text-[11px] font-semibold sm:inset-x-5 ${event.theme === "opensource" || event.theme === "web3" ? "text-ink" : "text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"}`}
        >
          {event.tagline}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-[18px]">
        {(event.registrationStatus || event.featured) && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            {event.registrationStatus && (
              <RegistrationBadge status={event.registrationStatus} />
            )}
            {event.featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1.5 text-[10px] font-semibold leading-none text-primary-strong">
                <Sparkles size={13} strokeWidth={2} /> Featured
              </span>
            )}
          </div>
        )}
        <h3 className="mb-1.5 line-clamp-2 font-display text-[19px] leading-[1.2] font-bold tracking-[-0.3px] text-ink ">
          {event.title}
        </h3>
        {event.desc && (
          <p className="mb-3 line-clamp-2 text-[13px] leading-[1.45] text-muted">
            {event.desc}
          </p>
        )}
        {event.organizer && (
          <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <Users size={14} strokeWidth={2} />
            {event.organizer}
          </p>
        )}
        <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-line pt-3 text-[12px] leading-4 font-medium text-muted">
          <MetadataItem
            icon={<CalendarDays size={15} strokeWidth={2} />}
            label={event.date}
            className="col-span-2"
          />
          <MetadataItem
            icon={<MapPin size={15} strokeWidth={2} />}
            label={event.place}
          />
          <MetadataItem
            icon={<Trophy size={15} strokeWidth={2} />}
            label={event.prize}
          />
          {event.registrationDeadline && (
            <MetadataItem
              icon={<CalendarDays size={15} strokeWidth={2} />}
              label={`Register by ${event.registrationDeadline}`}
              className="col-span-2"
            />
          )}
          {event.teamSize && (
            <MetadataItem
              icon={<Users size={15} strokeWidth={2} />}
              label={event.teamSize}
            />
          )}
          {typeof event.participants === "number" && (
            <MetadataItem
              icon={<Users size={15} strokeWidth={2} />}
              label={`${event.participants.toLocaleString()} participants`}
            />
          )}
        </div>
      </div>
    </article>
  );
  return event.href ? (
    <a
      href={event.href}
      aria-label={`View ${event.title}`}
      className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {card}
    </a>
  ) : (
    card
  );
}

function RegistrationBadge({
  status,
}: {
  status: NonNullable<Hackathon["registrationStatus"]>;
}) {
  const labels = {
    open: "Registration Open",
    closed: "Registration Closed",
    upcoming: "Registration Soon",
  };
  const colors =
    status === "open"
      ? "bg-accent-soft text-ink"
      : status === "closed"
        ? "bg-canvas text-muted"
        : "bg-brand-soft text-ink";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold leading-none ${colors}`}
    >
      {status === "open" ? (
        <CheckCircle2 size={13} strokeWidth={2} />
      ) : (
        <CalendarDays size={13} strokeWidth={2} />
      )}{" "}
      {labels[status]}
    </span>
  );
}

function MetadataItem({
  icon,
  label,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <span className="shrink-0 text-muted">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

function PosterArtwork({ theme }: { theme: string }) {
  if (theme === "summit")
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-10 -right-7 size-40 rounded-full border border-white/20" />
        <div className="absolute -top-4 right-2 size-24 rotate-45 border border-line/30" />
        <div className="absolute right-6 bottom-[-30px] grid size-28 rotate-12 grid-cols-2 gap-1.5 opacity-55">
          <span className="rounded-lg border border-white/35 bg-white/10" />
          <span className="rounded-lg bg-accent-soft/20" />
          <span className="rounded-lg bg-accent-soft/25" />
          <span className="rounded-lg border border-white/25" />
        </div>
        <Code2
          className="absolute right-[18%] top-[37%] size-6 text-white/60"
          strokeWidth={1.7}
        />
      </div>
    );
  if (theme === "ai")
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-7 -bottom-12 size-40 rounded-full bg-accent/15 blur-xl" />
        <div className="absolute top-1/2 right-7 size-20 -translate-y-1/2 rotate-12 rounded-[22px] border border-line/40 bg-accent-soft/10 shadow-[0_0_28px_rgba(185,237,50,0.12)]" />
        <div className="absolute top-[24%] right-[22%] size-9 rotate-45 border border-line/45 bg-accent-soft/10" />
        <div className="absolute right-[18%] bottom-[24%] size-2.5 rounded-full bg-accent-soft/90 shadow-[0_0_12px_rgba(185,237,50,0.65)]" />
      </div>
    );
  if (theme === "opensource")
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle,var(--color-line)_1px,transparent_1px)] [background-size:14px_14px]" />
        <div className="absolute top-1/2 right-8 grid size-16 -translate-y-1/2 place-items-center rounded-2xl border border-line/70 bg-white/55 text-primary-strong/65">
          <Code2 size={31} strokeWidth={1.6} />
        </div>
        <div className="absolute top-7 right-24 size-12 rotate-45 rounded-lg border border-line/60" />
      </div>
    );
  if (theme === "bangalore")
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute right-0 bottom-0 flex h-[48%] items-end gap-0.5 opacity-65">
          {[35, 48, 40, 62, 44, 70, 52, 38].map((height, index) => (
            <span
              key={index}
              className="w-4 rounded-t-sm border border-white/10 bg-slate-950/35"
              style={{ height: `${height}%` }}
            >
              <span className="mt-1.5 block size-1 bg-accent-soft/70" />
            </span>
          ))}
        </div>
        <div className="absolute right-[18%] bottom-0 h-[58%] w-px bg-accent-soft/45" />
        <div className="absolute right-[18%] bottom-[58%] size-2 -translate-x-1/2 rounded-full bg-accent-soft/90 shadow-[0_0_12px_5px_rgba(185,237,50,0.32)]" />
      </div>
    );
  if (theme === "web3")
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-9 right-8 size-28 rotate-45 border border-primary/25" />
        <div className="absolute right-10 bottom-[-24px] size-20 rotate-45 rounded-xl bg-primary-strong/70 shadow-[0_0_22px_rgba(185,237,50,0.22)]" />
        <div className="absolute right-24 bottom-7 size-12 rotate-45 border border-primary/20" />
      </div>
    );
  return null;
}
