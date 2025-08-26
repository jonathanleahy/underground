import type { Meta, StoryObj } from '@storybook/react';
import { HotelCard } from '@/components/molecules/HotelCard';
import { useState } from 'react';

const meta: Meta<typeof HotelCard> = {
  tags: ["autodocs"],
  title: 'Molecules/HotelCard',
  component: HotelCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Hotel Card Component

A comprehensive hotel display card that shows all essential information for hotel selection in the London Underground Hotel Finder application.

## Overview

The HotelCard component is a key molecule in our design system that combines multiple atomic components to display hotel information in a scannable, actionable format.

## Features

### Visual Hierarchy
- **Primary Information**: Hotel name and area prominently displayed
- **Pricing**: Clear price display with optional discount indicators
- **Journey Details**: Distance, walking time, and tube journey information  
- **Actions**: Book now and view details CTAs

### Interactive Elements
- Hover effects for enhanced user feedback
- Favorite toggle for saving preferences
- Click handlers for selection and route display
- Responsive design for mobile and desktop

## Usage

\`\`\`tsx
import { HotelCard } from '@/components/molecules/HotelCard';

<HotelCard
  name="Premier Inn London Victoria"
  area="Westminster"
  price={89}
  journeyTime={15}
  walkingTime={5}
  changes={1}
  nearestStation="Victoria"
  onSelect={() => handleSelect()}
  onShowRoute={() => showRoute()}
/>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | required | Hotel name |
| area | string | required | Hotel area/location |
| price | number | required | Price per night |
| journeyTime | number | - | Total journey time in minutes |
| walkingTime | number | - | Walking time to station |
| changes | number | - | Number of line changes |
| nearestStation | string | - | Nearest tube station |
| isHighlighted | boolean | false | Highlight state |
| onSelect | () => void | - | Selection handler |
| onShowRoute | () => void | - | Route display handler |

## Best Practices

### Do's
- Always provide hotel name and area - Essential for user orientation
- Include journey information - Critical for commuter decision making
- Show availability status - Prevents user frustration
- Use consistent pricing format - £XX format

### Don'ts
- Don't hide critical information - Price and journey time should always be visible
- Don't make cards too tall - Keep scannable in list view
- Don't autoplay animations - Let user control interactions
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '350px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic presenter
export const Default: Story = {
  args: {
    name: 'Premier Inn London County Hall',
    area: 'Waterloo',
    price: 89,
    onSelect: () => console.log('Hotel selected'),
  },
};

// With journey details
export const WithJourneyInfo: Story = {
  args: {
    name: 'Premier Inn London Kings Cross',
    area: 'Kings Cross',
    price: 125,
    journeyTime: 15,
    walkingTime: 5,
    changes: 1,
    nearestStation: 'Kings Cross St. Pancras',
    onSelect: () => console.log('Hotel selected'),
    onShowRoute: () => console.log('Show route clicked'),
  },
};

// Direct journey
export const DirectJourney: Story = {
  args: {
    name: 'Premier Inn London Victoria',
    area: 'Victoria',
    price: 99,
    journeyTime: 8,
    walkingTime: 2,
    changes: 0,
    nearestStation: 'Victoria',
    onSelect: () => console.log('Hotel selected'),
    onShowRoute: () => console.log('Show route clicked'),
  },
};

// Highlighted state
export const Highlighted: Story = {
  args: {
    name: 'Premier Inn London Leicester Square',
    area: 'Covent Garden',
    price: 145,
    journeyTime: 12,
    walkingTime: 3,
    changes: 1,
    nearestStation: 'Leicester Square',
    isHighlighted: true,
    onSelect: () => console.log('Hotel selected'),
    onShowRoute: () => console.log('Show route clicked'),
  },
};

// Container component managing multiple hotels
const HotelListContainer = () => {
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [routeShown, setRouteShown] = useState<string | null>(null);

  const hotels = [
    {
      id: '1',
      name: 'Premier Inn London County Hall',
      area: 'Waterloo',
      price: 89,
      journeyTime: 10,
      walkingTime: 5,
      changes: 0,
      nearestStation: 'Waterloo',
    },
    {
      id: '2',
      name: 'Premier Inn London Victoria',
      area: 'Victoria',
      price: 99,
      journeyTime: 15,
      walkingTime: 3,
      changes: 1,
      nearestStation: 'Victoria',
    },
    {
      id: '3',
      name: 'Premier Inn London Kings Cross',
      area: 'Kings Cross',
      price: 125,
      journeyTime: 20,
      walkingTime: 8,
      changes: 2,
      nearestStation: 'Kings Cross',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Selected: {selectedHotel || 'None'}
        </p>
        <p className="text-sm text-gray-600">
          Route shown for: {routeShown || 'None'}
        </p>
      </div>
      
      <div className="space-y-3">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            {...hotel}
            isHighlighted={selectedHotel === hotel.name}
            onSelect={() => setSelectedHotel(hotel.name)}
            onShowRoute={() => setRouteShown(hotel.name)}
          />
        ))}
      </div>
    </div>
  );
};

export const HotelList: Story = {
  render: () => <HotelListContainer />,
};

// Composition with price badge
import { PriceBadge } from '@/components/atoms/PriceBadge';

export const WithPriceBadgeComposition: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Best Value Hotels</h2>
        <PriceBadge price={89} variant="discount" />
      </div>
      <HotelCard
        name="Premier Inn London County Hall"
        area="Waterloo"
        price={89}
        journeyTime={10}
        walkingTime={5}
        changes={0}
        nearestStation="Waterloo"
        onSelect={() => console.log('Hotel selected')}
        onShowRoute={() => console.log('Show route')}
      />
    </div>
  ),
};