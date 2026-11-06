import type { Metadata } from "next";
import { Navbar, SiteFooter } from "@repo/ui";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";

export const metadata: Metadata = {
  title: "About HackRadar",
  description:
    "Discover open and upcoming hackathons with HackRadar.",
};

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto min-h-[60dvh] w-full max-w-site px-5 py-14 sm:px-8 lg:px-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-3 text-sm font-semibold"
        >
          <a href="/" className="text-muted hover:text-ink">
            Home
          </a>
          <span aria-hidden="true" className="text-muted">
            /
          </span>
          <span>About</span>
        </nav>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          About HackRadar
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
          HackRadar brings open and upcoming hackathons into one place. Browse by
          attendance mode, search by topic, and explore source-provided locations,
          submission periods, and prizes.
        </p>
        <div className="mt-10 grid max-w-3xl gap-8 border-t border-line pt-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-ink">Browse events</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Check submission periods, prize details, and locations before opening the
              details.
            </p>
            <a
              href="/hackathons"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink"
            >
              View hackathons
              <ArrowUpRightIcon size={16} />
            </a>
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Search by topic</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Search for an event name, a technology, or an organizer.
            </p>
            <a
              href="/#top"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink"
            >
              Search events
              <ArrowUpRightIcon size={16} />
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
