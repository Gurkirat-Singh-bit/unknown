import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatsRow } from "./hackradar";

const meta = { title: "HackRadar/Stats Row", component: StatsRow } satisfies Meta<typeof StatsRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
