import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { sampleStatistics } from "../../../stories/statistics";
import { HeroSection } from "./hero-section";

const meta = {
  title: "HackRadar/Hero Section",
  component: HeroSection,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HeroSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { statistics: sampleStatistics, onSearch: (value: string) => console.info("Search:", value) },
};
