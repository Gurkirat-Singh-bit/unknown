import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomeFixture } from "./home-fixture";

const meta = {
  title: "HackRadar/Home Page", component: HomeFixture,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HomeFixture>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
