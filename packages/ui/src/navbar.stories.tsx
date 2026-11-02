import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Navbar } from "./hackradar";

const meta = { title: "HackRadar/Navbar", component: Navbar, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Navbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
