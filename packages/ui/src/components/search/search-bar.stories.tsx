import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchBar } from "../search/search-bar";

const meta = {
  title: "HackRadar/Search Bar",
  component: SearchBar,
} satisfies Meta<typeof SearchBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { onSearch: (value: string) => console.info("Search:", value) },
};
