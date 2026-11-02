import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategoryGrid } from "./category-grid";

const meta = {
  title: "HackRadar/Category Grid",
  component: CategoryGrid,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CategoryGrid>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
