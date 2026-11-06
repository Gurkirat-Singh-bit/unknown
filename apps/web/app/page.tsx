import { Suspense } from "react";
import { CategoryGrid, Navbar, SiteFooter, StatsRow, TrendingSection } from "@repo/ui";
import { homeStats, latestEvents, cardEvent } from "../lib/events";
import { HomeHero } from "../components/home-hero";
import { StatisticsSkeleton } from "../components/statistics-skeleton";

export const dynamic = "force-dynamic";
export default function Home() {
  return <main className="min-h-screen bg-canvas"><Navbar />
    <HomeHero statisticsSlot={<Suspense fallback={<StatisticsSkeleton />}><HomeStatistics /></Suspense>} />
    <Suspense fallback={<TrendingSection loading />}><LatestHackathons /></Suspense>
    <CategoryGrid /><SiteFooter />
  </main>;
}
async function HomeStatistics() {
  const stats = await homeStats();
  return <StatsRow statistics={[
    { value: stats.total.toLocaleString(), label: "Hackathons" },
    { value: stats.open.toLocaleString(), label: "Open registrations" },
    { value: stats.upcoming.toLocaleString(), label: "Upcoming registrations" },
    { value: stats.online.toLocaleString(), label: "Online events" },
  ]} />;
}
async function LatestHackathons() {
  const rows = await latestEvents(8);
  return <TrendingSection events={rows.map(cardEvent)} />;
}
