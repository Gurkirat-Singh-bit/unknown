import type { Database } from "../client";
import { and, asc, desc, eq, gte, ne, or, sql } from "drizzle-orm";
import { events } from "../schema";

export type EventRecord = typeof events.$inferSelect;
export type BrowseOptions = {
  q?: string;
  mode?: string;
  status?: string;
  country?: string;
  tags?: string[];
  sort?: string;
  page?: number;
};
export const attendanceModes = ["online", "in_person", "hybrid", "unknown"] as const;
export const registrationStatuses = ["open", "upcoming", "unknown"] as const;
export const pageSize = 12;

export function normalizeBrowseOptions(input: BrowseOptions = {}): BrowseOptions {
  return {
    q: input.q?.trim().slice(0, 200) || undefined,
    mode: attendanceModes.some((mode) => mode === input.mode) ? input.mode : undefined,
    status: registrationStatuses.some((status) => status === input.status) ? input.status : undefined,
    country: input.country?.trim().slice(0, 200) || undefined,
    tags: [...new Set(input.tags ?? [])].filter((tag) => tag.length > 0 && tag.length <= 500).slice(0, 50),
    sort: input.sort === "title" ? "title" : "recent",
    page: Number.isSafeInteger(input.page) && input.page! > 0 ? input.page : 1,
  };
}

function activeHackathons(now: string) {
  // Scrape age deliberately does not expire a record.
  return and(
    eq(events.type, "hackathon"),
    ne(events.status, "ended"),
    or(sql`${events.endsAt} IS NULL`, gte(events.endsAt, now)),
  );
}
function filters(options: BrowseOptions, now: string) {
  const conditions = [activeHackathons(now)];
  if (options.q) {
    conditions.push(or(
      sql`instr(lower(${events.title}), lower(${options.q})) > 0`,
      sql`instr(lower(coalesce(${events.organizer}, '')), lower(${options.q})) > 0`,
      sql`EXISTS (SELECT 1 FROM json_each(${events.tags}) WHERE instr(lower(value), lower(${options.q})) > 0)`,
    ));
  }
  if (options.mode) conditions.push(eq(events.mode, options.mode as typeof attendanceModes[number]));
  if (options.status) conditions.push(eq(events.status, options.status as typeof registrationStatuses[number]));
  if (options.country === "unspecified") {
    conditions.push(sql`${events.country} IS NULL`, ne(events.mode, "online"));
  } else if (options.country) conditions.push(eq(events.country, options.country));
  if (options.tags?.length) {
    conditions.push(sql`EXISTS (SELECT 1 FROM json_each(${events.tags}) WHERE value IN (${sql.join(options.tags.map((tag) => sql`${tag}`), sql`, `)}))`);
  }
  return and(...conditions);
}

export async function catalogueFilters(db: Database) {
  const rows = await db.select({ country: events.country, mode: events.mode, tags: events.tags })
    .from(events).where(activeHackathons(new Date().toISOString()));
  return {
    countries: [...new Set(rows.map((row) => row.country).filter((value): value is string => Boolean(value)))].sort(),
    hasUnspecifiedCountry: rows.some((row) => !row.country && row.mode !== "online"),
    tags: [...new Set(rows.flatMap((row) => row.tags))].sort(),
  };
}

export async function browseEvents(db: Database, input: BrowseOptions = {}) {
  const available = await catalogueFilters(db);
  const options = normalizeBrowseOptions(input);
  if (options.country && options.country !== "unspecified" && !available.countries.includes(options.country)) options.country = undefined;
  options.tags = options.tags?.filter((tag) => available.tags.includes(tag));
  const where = filters(options, new Date().toISOString());
  const [count] = await db.select({ total: sql<number>`count(*)` }).from(events).where(where);
  const total = Number(count?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(options.page ?? 1, pages);
  const rows = await db.select().from(events).where(where)
    .orderBy(options.sort === "title" ? asc(sql`${events.title} COLLATE NOCASE`) : desc(events.createdAt), asc(events.id))
    .limit(pageSize).offset((page - 1) * pageSize);
  return { rows, total, page, pages, ...available, options: { ...options, page } };
}

export async function latestEvents(db: Database, limit = 8) {
  return db.select().from(events).where(activeHackathons(new Date().toISOString()))
    .orderBy(desc(events.createdAt), asc(events.id)).limit(limit);
}
export async function homeStats(db: Database) {
  const [row] = await db.select({
    total: sql<number>`count(*)`,
    open: sql<number>`coalesce(sum(${events.status} = 'open'), 0)`,
    upcoming: sql<number>`coalesce(sum(${events.status} = 'upcoming'), 0)`,
    online: sql<number>`coalesce(sum(${events.mode} = 'online'), 0)`,
  }).from(events).where(activeHackathons(new Date().toISOString()));
  return { total: Number(row?.total ?? 0), open: Number(row?.open ?? 0), upcoming: Number(row?.upcoming ?? 0), online: Number(row?.online ?? 0) };
}
export async function eventByIdentity(db: Database, source: string, sourceId: string) {
  const [row] = await db.select().from(events)
    .where(and(eq(events.type, "hackathon"), eq(events.source, source), eq(events.sourceId, sourceId))).limit(1);
  return row ?? null;
}
