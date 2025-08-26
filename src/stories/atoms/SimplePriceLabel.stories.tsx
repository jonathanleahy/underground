import type { Meta, StoryObj } from '@storybook/react';
import { SimplePriceLabel } from '@/components/atoms/SimplePriceLabel';

const meta: Meta<typeof SimplePriceLabel> = {
  tags: ["autodocs"],
  title: 'Atoms/SimplePriceLabel',
  component: SimplePriceLabel,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    price: {
      control: { type: 'number', min: 0, max: 500, step: 10 },
    },
    originalPrice: {
      control: { type: 'number', min: 0, max: 500, step: 10 },
    },
    journeyTime: {
      control: { type: 'number', min: 0, max: 120, step: 5 },
    },
    available: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    price: 89,
    available: true,
  },
};

export const WithDiscount: Story = {
  args: {
    price: 45,
    originalPrice: 89,
    available: true,
  },
};

export const WithJourneyTime: Story = {
  args: {
    price: 125,
    journeyTime: 15,
    available: true,
  },
};

export const FullFeatures: Story = {
  args: {
    price: 65,
    originalPrice: 120,
    journeyTime: 25,
    available: true,
  },
};

export const SoldOut: Story = {
  args: {
    available: false,
  },
};

// Composition example showing multiple price labels
export const PriceLabelComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <SimplePriceLabel price={45} />
        <span className="text-sm text-gray-600">Budget Option</span>
      </div>
      <div className="flex items-center gap-4">
        <SimplePriceLabel price={89} originalPrice={120} />
        <span className="text-sm text-gray-600">Discounted</span>
      </div>
      <div className="flex items-center gap-4">
        <SimplePriceLabel price={150} journeyTime={10} />
        <span className="text-sm text-gray-600">Premium with Quick Access</span>
      </div>
      <div className="flex items-center gap-4">
        <SimplePriceLabel available={false} />
        <span className="text-sm text-gray-600">Not Available</span>
      </div>
    </div>
  ),
};