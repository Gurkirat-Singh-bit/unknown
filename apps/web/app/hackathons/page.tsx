import { Navbar, SiteFooter } from "@repo/ui";
import { redirect } from "next/navigation";
import { browseEvents, cardEvent } from "../../lib/events";
import { Catalogue } from "../../components/catalogue";
import { catalogueUrl } from "../../lib/catalogue-url";

export const dynamic = "force-dynamic";
type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
export default async function HackathonsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const requestedPage = Number(one(params.page) ?? 1);
  const result = await browseEvents({
    q: one(params.q), mode: one(params.mode), status: one(params.status),
    country: one(params.country), sort: one(params.sort), page: requestedPage,
    tags: Array.isArray(params.tag) ? params.tag : params.tag ? [params.tag] : [],
  });
  if (Number.isSafeInteger(requestedPage) && requestedPage > result.pages) redirect(catalogueUrl(result.options));
  return <main className="min-h-screen bg-canvas"><Navbar /><Catalogue key={catalogueUrl(result.options)} events={result.rows.map(cardEvent)} total={result.total} pages={result.pages} options={result.options} countries={result.countries} hasUnspecifiedCountry={result.hasUnspecifiedCountry} tags={result.tags} /><SiteFooter /></main>;
}
