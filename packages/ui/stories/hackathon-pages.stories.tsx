import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Navbar, SiteFooter } from "../src";
import { HomeFixture } from "./home-fixture";
import { Catalogue } from "../../../apps/web/components/catalogue";
import { sampleEvents } from "./events";

const meta = {
  title: "HackRadar/Hackathon Pages", component: HomeFixture,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
} satisfies Meta<typeof HomeFixture>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Hackathons: Story = {};
export const ExploreHackathons: Story = {
  render: () => <main><Navbar /><Catalogue events={sampleEvents} total={sampleEvents.length} pages={1} options={{ page: 1, sort: "recent" }} countries={["India", "United States"]} tags={["AI", "Open Source"]} /><SiteFooter /></main>,
};
