import type { EventRecord } from "./events";

// Only combine facts already present in the source record; do not invent a project brief.
export function eventBrief(event: EventRecord) {
  if (event.description?.trim()) return event.description.trim();
  const facts = [`${event.title} is a hackathon${event.organizer ? ` organized by ${event.organizer}` : ""}.`];
  if (event.mode === "online") facts.push("The event is held online.");
  if (event.mode === "in_person") facts.push("The attendance format is in person.");
  if (event.mode === "hybrid") facts.push("The event has a hybrid attendance format.");
  if (event.location && event.location.toLowerCase() !== "online") facts.push(`The listed location is ${event.location}.`);
  if (event.tags.length) facts.push(`Listed themes include ${event.tags.join(", ")}.`);
  if (event.status !== "unknown") facts.push(`Registration is listed as ${event.status}.`);
  if (event.submissionPeriod) facts.push(`Submissions are listed for ${event.submissionPeriod}.`);
  if (event.prizeText) facts.push(`Listed prizes: ${event.prizeText}.`);
  return facts.join(" ");
}
