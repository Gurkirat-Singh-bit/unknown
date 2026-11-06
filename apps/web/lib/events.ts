import { env } from "cloudflare:workers";
import { createDb } from "@repo/db/client";
import * as catalogue from "@repo/db/queries/catalogue";
import type { EventRecord } from "@repo/db/queries/catalogue";
export type { EventRecord };
export const browseEvents = (options: catalogue.BrowseOptions = {}) => catalogue.browseEvents(createDb(env.DB), options);
export const latestEvents = (limit = 8) => catalogue.latestEvents(createDb(env.DB), limit);
export const homeStats = () => catalogue.homeStats(createDb(env.DB));
export const eventByIdentity = (source: string, sourceId: string) => catalogue.eventByIdentity(createDb(env.DB), source, sourceId);
export function cardEvent(event: EventRecord) {
  return {
    title: event.title, tagline: event.organizer ?? event.source,
    desc: event.description ?? "", date: event.submissionPeriod ? `Submissions: ${event.submissionPeriod}` : "",
    place: event.location ?? "", prize: event.prizeText ?? "",
    mode: event.mode === "online" ? "Online" as const : event.mode === "in_person" ? "In-person" as const : event.mode === "hybrid" ? "Hybrid" as const : "Unknown" as const,
    theme: "summit", href: `/hackathons/${encodeURIComponent(event.source)}/${encodeURIComponent(event.sourceId)}`,
    registrationStatus: event.status === "open" || event.status === "upcoming" ? event.status : undefined,
    organizer: event.organizer ?? undefined, imageUrl: event.imageUrl, tags: event.tags,
  };
}
