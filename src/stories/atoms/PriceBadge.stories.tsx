import type { Meta, StoryObj } from '@storybook/react';
import { PriceBadge } from '@/components/atoms/PriceBadge';

const meta = {
  title: 'Atoms/PriceBadge',
  component: PriceBadge,
  parameters: {
    layout: 'centered',
  },
  
  argTypes: {
    price: {
      control: { type: 'number', min: 0, max: 500, step: 10 },
      description: 'Price value to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the price badge',
    },
    variant: {
      control: 'select',
      options: ['default', 'discount', 'premium'],
      description: 'Visual variant of the price badge',
    },
  },
} satisfies Meta<typeof PriceBadge>;

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
    variant: 'premium',
  },
};

export const DiscountPrice: Story = {
  args: {
    price: 79,
    size: 'md', 
    variant: 'discount',
  },
};