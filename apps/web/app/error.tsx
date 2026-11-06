"use client";
import { Navbar, SiteFooter } from "@repo/ui";
export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="min-h-screen bg-canvas"><Navbar /><section className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="font-display text-3xl font-bold">The catalogue is unavailable</h1><p className="mt-4 text-sm leading-6 text-muted">We couldn’t load the hackathons. Please try again in a moment.</p><button onClick={reset} className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary">Try again</button></section><SiteFooter /></main>;
}
