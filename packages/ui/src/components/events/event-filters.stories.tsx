import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventFilters } from "./event-filters";
import { type EventMode } from "../../types/event";

const meta = {
  title: "HackRadar/Event Filters",
  component: EventFilters,
} satisfies Meta<typeof EventFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  args: { mode: "All", onChange: () => {} },
  render: () => {
    const [mode, setMode] = useState<EventMode>("All");
    return <EventFilters mode={mode} onChange={setMode} />;
  },
};
