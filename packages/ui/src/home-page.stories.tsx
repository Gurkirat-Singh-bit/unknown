import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategoryGrid, HeroSection, Navbar, sampleEvents, SiteFooter, type EventMode, TrendingSection } from "./hackradar";

function HomePagePreview() {
  const [mode, setMode] = useState<EventMode>("All");
  const [search, setSearch] = useState("");
  const events = useMemo(() => sampleEvents.filter((event) => (mode === "All" || event.mode === mode) && (!search || `${event.title} ${event.desc} ${event.place}`.toLowerCase().includes(search.toLowerCase()))), [mode, search]);
  return <main className="min-h-screen bg-white"><Navbar/><HeroSection mode={mode} onModeChange={setMode} onSearch={setSearch}/><TrendingSection events={events}/><CategoryGrid/><SiteFooter/></main>;
}

const meta = { title: "HackRadar/Home Page", component: HomePagePreview, parameters: { layout: "fullscreen" } } satisfies Meta<typeof HomePagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
