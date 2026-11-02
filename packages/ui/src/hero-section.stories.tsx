import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroSection, type EventMode } from "./hackradar";

const meta = { title: "HackRadar/Hero Section", component: HeroSection, parameters: { layout: "fullscreen" } } satisfies Meta<typeof HeroSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { mode: "All", onModeChange: () => {}, onSearch: () => {} }, render: () => { const [mode, setMode] = useState<EventMode>("All"); return <HeroSection mode={mode} onModeChange={setMode} onSearch={(value) => console.info("Search:", value)}/>; } };
