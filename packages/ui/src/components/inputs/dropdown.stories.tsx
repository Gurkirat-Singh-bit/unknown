import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Dropdown } from "./dropdown";

const meta = {
  title: "HackRadar/Inputs/Dropdown",
  component: Dropdown,
  parameters: { layout: "centered" },
  args: {
    label: "Sort events",
    value: "deadline",
    onValueChange: () => {},
    options: [
      { value: "deadline", label: "Upcoming Deadlines" },
      { value: "prize", label: "Prize Pool" },
      { value: "recent", label: "Recently Added" },
    ],
  },
  render: function Example(args) {
    const [value, setValue] = useState(args.value);
    return <Dropdown {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof Dropdown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
