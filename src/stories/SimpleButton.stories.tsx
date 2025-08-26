import type { Meta, StoryObj } from '@storybook/react';

const SimpleButton = ({ label, className }: { label: string; className?: string }) => {
  return (
    <button className={className || "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}>
      {label}
    </button>
  );
};

const meta = {
  title: 'Test/SimpleButton',
  component: SimpleButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SimpleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Click Me',
  },
};

export const WithTailwind: Story = {
  args: {
    label: 'Tailwind Button',
    className: 'px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-colors',
  },
};