import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroSection } from "./hero-section";

const meta = {
  title: "HackRadar/Hero Section",
  component: HeroSection,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HeroSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { onSearch: (value: string) => console.info("Search:", value) },
};
