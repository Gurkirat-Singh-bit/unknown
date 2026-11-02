import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TrendingSection } from "./hackradar";

const meta = { title: "HackRadar/Trending Section", component: TrendingSection, parameters: { layout: "fullscreen" } } satisfies Meta<typeof TrendingSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
