import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteFooter } from "./hackradar";

const meta = { title: "HackRadar/Site Footer", component: SiteFooter } satisfies Meta<typeof SiteFooter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
