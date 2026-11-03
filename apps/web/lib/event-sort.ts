import type { Hackathon } from "@repo/ui/types";

export function eventDeadline(event: Hackathon): number {
  if (event.registrationDeadline) {
    const explicit = Date.parse(event.registrationDeadline);
    if (Number.isFinite(explicit)) return explicit;
  }
  const date = event.date.match(
    /([A-Za-z]+)\s+(\d{1,2})(?:\s*[–-]\s*(?:([A-Za-z]+)\s+)?(\d{1,2}))?,?\s+(\d{4})/,
  );
  if (!date) return Number.MAX_SAFE_INTEGER;
  const parsed = Date.parse(
    `${date[3] ?? date[1]} ${date[4] ?? date[2]}, ${date[5]}`,
  );
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export function eventPrize(event: Hackathon): number {
  return Number(event.prize.replace(/[^\d.]/g, "")) || 0;
}
