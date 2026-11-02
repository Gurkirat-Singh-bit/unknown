import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Home from "../../../apps/web/app/page";

const meta = {
  title: "HackRadar/Home Page",
  component: Home,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Home>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
