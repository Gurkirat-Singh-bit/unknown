import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Home from "../../../apps/web/app/page";
import DiscoverHackathonsPage from "../../../apps/web/app/hackathons/page";

const meta = {
  title: "HackRadar/Hackathon Pages",
  component: Home,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Home>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Hackathons: Story = {};
export const ExploreHackathons: Story = {
  render: () => <DiscoverHackathonsPage />,
};
