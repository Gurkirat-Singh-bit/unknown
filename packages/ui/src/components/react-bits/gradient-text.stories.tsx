import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GradientText from "./gradient-text";

const meta = {
  title: "HackRadar/React Bits/Gradient Text",
  component: GradientText,
  parameters: { layout: "centered" },
  args: {
    children: "Discover your next hackathon",
    animationSpeed: 8,
    className: "font-display text-3xl font-bold",
    pauseOnHover: true,
  },
} satisfies Meta<typeof GradientText>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const CyanAccent: Story = {
  args: {
    colors: [
      "var(--color-primary-strong)",
      "var(--color-accent)",
      "var(--color-primary-strong)",
    ],
  },
};
