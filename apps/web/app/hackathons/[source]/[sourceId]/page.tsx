import { notFound } from "next/navigation";
import { Navbar, SiteFooter, EventImage } from "@repo/ui";
import { eventByIdentity } from "../../../../lib/events";
import { eventBrief } from "../../../../lib/event-brief";
import { EventLinks } from "../../../../components/event-links";
import { catalogueUrl } from "../../../../lib/catalogue-url";

export const dynamic = "force-dynamic";
const modes = { online: "Online", in_person: "In person", hybrid: "Hybrid", unknown: "Not specified" };
const statuses = { open: "Registration open", upcoming: "Registration upcoming", ended: "Registration ended", unknown: "Registration not specified" };
export default async function HackathonDetails({ params }: { params: Promise<{ source: string; sourceId: string }> }) {
  const { source, sourceId } = await params;
  const event = await eventByIdentity(source, sourceId);
  if (!event) notFound();
  const permalink = `/hackathons/${encodeURIComponent(event.source)}/${encodeURIComponent(event.sourceId)}`;
  return <main className="min-h-screen bg-canvas"><Navbar />
    <div className="mx-auto max-w-site px-5 py-7 sm:px-8 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted"><a href="/">Home</a><span>/</span><a href="/hackathons">Hackathons</a><span>/</span><span className="truncate text-ink">{event.title}</span></nav>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <EventImage src={event.imageUrl} alt={`${event.title} poster`} className="min-h-72 rounded-2xl sm:min-h-96" />
        <section className="flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold"><span className="rounded-full bg-brand-soft px-3 py-1.5 text-primary-strong">{statuses[event.status]}</span><span className="rounded-full border border-line px-3 py-1.5 text-muted">{modes[event.mode]}</span></div>
          <h1 className="mt-5 font-display text-3xl leading-tight font-extrabold tracking-tight text-ink sm:text-4xl">{event.title}</h1>
          {event.organizer && <p className="mt-3 text-sm text-muted">Organized by <span className="font-semibold text-ink">{event.organizer}</span></p>}
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{eventBrief(event)}</p>
          <a href="#hackathon-brief" className="mt-2 text-xs font-semibold text-primary-strong">Read the brief ↓</a>
          <dl className="my-6 grid gap-4 border-y border-line py-5">{event.submissionPeriod && <Detail label="Submissions" value={event.submissionPeriod} />}{event.location && <Detail label="Location" value={event.location} />}{event.prizeText && <Detail label="Prizes" value={event.prizeText} />}</dl>
          <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="mt-auto flex min-h-12 items-center justify-between rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary">View event on {event.source}<span aria-hidden="true">↗</span></a>
          <p className="mt-3 text-center text-xs leading-5 text-muted">Visit the organizer’s page for full details and registration.</p>
        </section>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <article id="hackathon-brief" className="scroll-mt-6 min-w-0 rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink">Hackathon brief</h2>
          {!event.description && <p className="mt-2 text-xs text-muted">Summary from the source listing</p>}
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{eventBrief(event)}</p>
          {event.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{event.tags.map((tag) => <a key={tag} href={catalogueUrl({ tags: [tag] })} className="rounded-full bg-brand-soft px-3 py-2 text-xs font-semibold text-primary-strong hover:bg-lime-soft">{tag}</a>)}</div>}
          <div className="mt-7 border-t border-line pt-6"><h3 className="text-sm font-bold text-ink">Before you join</h3><p className="mt-2 text-sm leading-6 text-muted">Review the organizer’s eligibility rules, project requirements, and submission instructions before registering.</p></div>
        </article>
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <aside className="h-fit rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-bold">At a glance</h2><dl className="mt-5 space-y-5"><Detail label="Attendance" value={modes[event.mode]} /><Detail label="Source" value={event.source} /><Detail label="Last updated" value={new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(event.updatedAt)) + " UTC"} /></dl>
        </aside>
        <EventLinks sourceUrl={event.sourceUrl} source={event.source} permalink={permalink} />
        </div>
      </div>
      <a href="/hackathons" className="mt-8 inline-flex py-3 text-sm font-semibold text-primary-strong">← Back to hackathons</a>
    </div><SiteFooter />
  </main>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-semibold leading-6 text-ink">{value}</dd></div>;
}
