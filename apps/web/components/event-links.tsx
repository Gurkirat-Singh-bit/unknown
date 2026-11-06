"use client";
import { useState } from "react";

export function EventLinks({ sourceUrl, source, permalink }: { sourceUrl: string; source: string; permalink: string }) {
  const [message, setMessage] = useState("");
  async function copy(kind: "event" | "source") {
    try {
      await navigator.clipboard.writeText(kind === "source" ? sourceUrl : new URL(permalink, window.location.origin).href);
      setMessage(kind === "source" ? "Source link copied." : "Event link copied.");
    } catch { setMessage("Copy is unavailable. You can select the link below."); }
  }
  return <section className="rounded-2xl border border-line bg-surface p-6">
    <h2 className="font-display text-lg font-bold text-ink">Event links</h2>
    <p className="mt-2 text-xs leading-5 text-muted">Keep this page handy or open the organizer’s original listing.</p>
    <div className="mt-4 space-y-4 text-xs"><div><p className="mb-1 font-semibold text-muted">HackRadar page</p><a href={permalink} className="break-all leading-5 text-primary-strong hover:underline">{permalink}</a></div><div><p className="mb-1 font-semibold text-muted">Original listing · {source}</p><a href={sourceUrl} target="_blank" rel="noreferrer" className="break-all leading-5 text-primary-strong hover:underline">{sourceUrl}</a></div></div>
    <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => void copy("event")} className="rounded-xl border border-line px-3 py-2.5 text-xs font-semibold text-ink hover:bg-canvas">Copy event link</button><button onClick={() => void copy("source")} className="rounded-xl border border-line px-3 py-2.5 text-xs font-semibold text-ink hover:bg-canvas">Copy source link</button></div>
    <p role="status" className="mt-3 min-h-5 text-xs text-primary-strong">{message}</p>
  </section>;
}
