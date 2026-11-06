import { Navbar, SiteFooter } from "@repo/ui";
export default function NotFound() {
  return <main className="min-h-screen bg-canvas"><Navbar /><section className="mx-auto max-w-xl px-5 py-24 text-center"><p className="text-sm font-bold tracking-widest text-primary-strong">404</p><h1 className="mt-4 font-display text-3xl font-bold">This page couldn’t be found</h1><p className="mt-4 text-sm leading-6 text-muted">Explore the catalogue to find your next hackathon.</p><a href="/hackathons" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary">Browse hackathons</a></section><SiteFooter /></main>;
}
