import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { sampleStatistics } from "../../../stories/statistics";
import { StatsRow } from "./stats-row";

const meta = {
  title: "HackRadar/Stats Row",
  component: StatsRow,
} satisfies Meta<typeof StatsRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { statistics: sampleStatistics } };
