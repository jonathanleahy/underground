import type { Meta, StoryObj } from '@storybook/react';
import { HotelListItem } from '@/components/atoms/HotelListItem';
import { useState } from 'react';

const meta: Meta<typeof HotelListItem> = {
  tags: ["autodocs"],
  title: 'Atoms/HotelListItem',
  component: HotelListItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-6 bg-gray-50">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Premier Inn London County Hall',
    distance: '0.5 miles',
    walkingTime: 8,
    price: 89,
    rating: 4.5,
    amenities: ['WiFi', 'Breakfast'],
    onShowRoute: () => console.log('Show route'),
  },
};

export const WithDiscount: Story = {
  args: {
    name: 'Premier Inn London Victoria',
    distance: '0.3 miles',
    walkingTime: 5,
    price: 65,
    originalPrice: 120,
    rating: 4.7,
    amenities: ['WiFi', 'Breakfast', 'Parking'],
    availability: 'limited',
    onShowRoute: () => console.log('Show route'),
  },
};

export const Selected: Story = {
  args: {
    name: 'Premier Inn London Kings Cross',
    distance: '0.8 miles',
    walkingTime: 12,
    price: 125,
    rating: 4.8,
    isSelected: true,
    amenities: ['WiFi'],
    onShowRoute: () => console.log('Show route'),
  },
};

export const SoldOut: Story = {
  args: {
    name: 'Premier Inn London Leicester Square',
    distance: '0.2 miles',
    walkingTime: 3,
    price: 145,
    rating: 4.9,
    availability: 'sold-out',
    amenities: ['WiFi', 'Breakfast'],
    onShowRoute: () => console.log('Show route'),
  },
};

export const InteractiveList: Story = {
  render: () => {
    const [selectedHotel, setSelectedHotel] = useState<number | null>(null);
    const [favorites, setFavorites] = useState<Set<number>>(new Set([1]));

    const hotels = [
      {
        id: 0,
        name: 'Premier Inn London County Hall',
        distance: '0.5 miles',
        walkingTime: 8,
        price: 89,
        originalPrice: 120,
        rating: 4.5,
        amenities: ['WiFi', 'Breakfast'],
      },
      {
        id: 1,
        name: 'Premier Inn London Victoria',
        distance: '0.3 miles',
        walkingTime: 5,
        price: 65,
        originalPrice: 99,
        rating: 4.7,
        amenities: ['WiFi', 'Breakfast', 'Parking'],
        availability: 'limited' as const,
      },
      {
        id: 2,
        name: 'Premier Inn London Kings Cross',
        distance: '0.8 miles',
        walkingTime: 12,
        price: 125,
        rating: 4.8,
        amenities: ['WiFi'],
      },
      {
        id: 3,
        name: 'Premier Inn London Leicester Square',
        distance: '0.2 miles',
        walkingTime: 3,
        price: 145,
        rating: 4.9,
        availability: 'sold-out' as const,
        amenities: ['WiFi', 'Breakfast'],
      },
    ];

    return (
      <div className="space-y-3">
        {hotels.map((hotel) => (
          <HotelListItem
            key={hotel.id}
            {...hotel}
            isSelected={selectedHotel === hotel.id}
            isFavorite={favorites.has(hotel.id)}
            onSelect={() => setSelectedHotel(hotel.id)}
            onShowRoute={() => console.log('Show route for', hotel.name)}
            onToggleFavorite={() => {
              const newFavorites = new Set(favorites);
              if (newFavorites.has(hotel.id)) {
                newFavorites.delete(hotel.id);
              } else {
                newFavorites.add(hotel.id);
              }
              setFavorites(newFavorites);
            }}
          />
        ))}
      </div>
    );
  },
};