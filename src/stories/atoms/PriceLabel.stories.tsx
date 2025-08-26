import type { Meta, StoryObj } from '@storybook/react';
import { PriceLabel } from '@/components/atoms/PriceLabel';

const meta = {
  title: 'Atoms/PriceLabel',
  component: PriceLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    price: {
      control: { type: 'number', min: 0, max: 500, step: 10 },
      description: 'Price value to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the price label',
    },
  },
} satisfies Meta<typeof PriceLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    price: 89,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    price: 125,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    price: 250,
    size: 'lg',
  },
};

export const BudgetPrice: Story = {
  args: {
    price: 45,
    size: 'md',
  },
};

export const PremiumPrice: Story = {
  args: {
    price: 399,
    size: 'md',
  },
};