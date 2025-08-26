import type { Meta, StoryObj } from '@storybook/react';
import { PriceBadge } from '@/components/atoms/PriceBadge';

const meta: Meta<typeof PriceBadge> = {
  tags: ["autodocs"],
  title: 'Atoms/PriceBadge',
  component: PriceBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    price: {
      control: { type: 'number', min: 0, max: 500, step: 10 },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'discount', 'premium'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    price: 89,
    size: 'md',
    variant: 'default',
  },
};

export const Small: Story = {
  args: {
    price: 45,
    size: 'sm',
    variant: 'default',
  },
};

export const Large: Story = {
  args: {
    price: 120,
    size: 'lg',
    variant: 'default',
  },
};

export const Discount: Story = {
  args: {
    price: 35,
    size: 'md',
    variant: 'discount',
  },
};

export const Premium: Story = {
  args: {
    price: 250,
    size: 'md',
    variant: 'premium',
  },
};

// Composition example
export const PriceBadgeGroup: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <PriceBadge price={45} variant="discount" size="sm" />
      <PriceBadge price={89} variant="default" size="md" />
      <PriceBadge price={150} variant="premium" size="lg" />
    </div>
  ),
};