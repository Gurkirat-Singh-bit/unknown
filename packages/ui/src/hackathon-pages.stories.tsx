import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategoryGrid, HeroSection, Navbar, sampleEvents, SiteFooter, type EventMode, TrendingSection } from "./hackradar";
import { DiscoverHackathonsPage } from "./discover-pages";

function HackathonsHome() {
  const [mode, setMode] = useState<EventMode>("All");
  const [search, setSearch] = useState("");
  const events = useMemo(() => sampleEvents.filter((event) => (mode === "All" || event.mode === mode) && (!search || `${event.title} ${event.desc} ${event.place}`.toLowerCase().includes(search.toLowerCase()))), [mode, search]);
  return <main className="min-h-screen bg-white"><Navbar/><HeroSection mode={mode} onModeChange={setMode} onSearch={setSearch}/><TrendingSection events={events}/><CategoryGrid/><SiteFooter/></main>;
}

const meta = { title: "HackRadar/Hackathon Pages", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Hackathons: Story = { render: () => <HackathonsHome/> };
export const ExploreHackathons: Story = { render: () => <DiscoverHackathonsPage/> };
