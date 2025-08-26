import type { Meta, StoryObj } from '@storybook/react';
import { HotelCard } from '@/components/molecules/HotelCard';

const meta = {
  title: 'Molecules/HotelCard',
  component: HotelCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    area: { control: 'text' },
    price: { control: { type: 'number', min: 0, max: 500 } },
    journeyTime: { control: { type: 'number', min: 0, max: 120 } },
    walkingTime: { control: { type: 'number', min: 0, max: 30 } },
    changes: { control: { type: 'number', min: 0, max: 5 } },
    nearestStation: { control: 'text' },
    isHighlighted: { control: 'boolean' },
  },
} satisfies Meta<typeof HotelCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'London County Hall',
    area: 'South Bank',
    price: 125,
  },
};

export const WithJourneyInfo: Story = {
  args: {
    name: 'London Victoria',
    area: 'Victoria',
    price: 145,
    journeyTime: 25,
    walkingTime: 8,
    changes: 1,
    nearestStation: 'Victoria',
  },
};

export const DirectRoute: Story = {
  args: {
    name: 'London King\'s Cross',
    area: 'King\'s Cross',
    price: 135,
    journeyTime: 15,
    walkingTime: 5,
    changes: 0,
    nearestStation: 'King\'s Cross St. Pancras',
  },
};

export const Highlighted: Story = {
  args: {
    name: 'London Paddington',
    area: 'Paddington',
    price: 155,
    journeyTime: 20,
    walkingTime: 6,
    changes: 1,
    nearestStation: 'Paddington',
    isHighlighted: true,
  },
};

export const BudgetOption: Story = {
  args: {
    name: 'London Edmonton',
    area: 'Edmonton',
    price: 65,
    journeyTime: 45,
    walkingTime: 12,
    changes: 2,
    nearestStation: 'Edmonton Green',
  },
};

export const PremiumCentral: Story = {
  args: {
    name: 'London Leicester Square',
    area: 'West End',
    price: 225,
    journeyTime: 10,
    walkingTime: 3,
    changes: 0,
    nearestStation: 'Leicester Square',
  },
};