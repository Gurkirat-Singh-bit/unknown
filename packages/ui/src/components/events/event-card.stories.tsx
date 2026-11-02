import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventCard } from "./event-card";
import { sampleEvents } from "../../../stories/events";

const meta = {
  title: "HackRadar/Event Card",
  component: EventCard,
} satisfies Meta<typeof EventCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DeveloperSummit: Story = { args: { event: sampleEvents[0]! } };
export const ArtificialIntelligence: Story = {
  args: { event: sampleEvents[1]! },
};
export const OpenSource: Story = { args: { event: sampleEvents[2]! } };
export const PosterComparison: Story = {
  args: { event: sampleEvents[0]! },
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="mx-auto grid max-w-[1396px] grid-cols-1 gap-4 p-6 md:grid-cols-3">
      {sampleEvents.slice(0, 3).map((event) => (
        <EventCard key={event.title} event={event} />
      ))}
    </div>
  ),
};
