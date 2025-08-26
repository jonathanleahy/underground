import type { Meta, StoryObj } from '@storybook/react';
import { ModernHotelCard } from '@/components/molecules/ModernHotelCard';
import { useState } from 'react';

const meta: Meta<typeof ModernHotelCard> = {
  tags: ["autodocs"],
  title: 'Molecules/ModernHotelCard',
  component: ModernHotelCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md p-6 bg-gray-50">
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
    area: 'Waterloo',
    price: 89,
    originalPrice: 149,
    rating: 4.5,
    reviewCount: 2341,
    journeyTime: 10,
    walkingTime: 5,
    changes: 0,
    nearestStation: 'Waterloo',
    isPopular: true,
    amenities: ['WiFi', 'Parking', 'Breakfast'],
  },
};

export const WithDiscount: Story = {
  args: {
    name: 'Premier Inn London Victoria',
    area: 'Victoria',
    price: 65,
    originalPrice: 120,
    rating: 4.7,
    reviewCount: 1856,
    journeyTime: 15,
    walkingTime: 3,
    changes: 1,
    nearestStation: 'Victoria',
    isPopular: false,
    amenities: ['WiFi', 'Breakfast'],
  },
};

export const DirectRoute: Story = {
  args: {
    name: 'Premier Inn London Kings Cross',
    area: 'Kings Cross',
    price: 125,
    rating: 4.8,
    reviewCount: 3421,
    journeyTime: 8,
    walkingTime: 2,
    changes: 0,
    nearestStation: 'Kings Cross St. Pancras',
    isPopular: true,
    amenities: ['WiFi', 'Parking', 'Breakfast'],
  },
};

// Container with multiple cards
const HotelGridContainer = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const hotels = [
    {
      id: '1',
      name: 'Premier Inn London County Hall',
      area: 'Waterloo',
      price: 89,
      originalPrice: 149,
      rating: 4.5,
      reviewCount: 2341,
      journeyTime: 10,
      walkingTime: 5,
      changes: 0,
      nearestStation: 'Waterloo',
      isPopular: true,
    },
    {
      id: '2',
      name: 'Premier Inn London Victoria',
      area: 'Victoria',
      price: 65,
      originalPrice: 120,
      rating: 4.7,
      reviewCount: 1856,
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
      rating: 4.8,
      reviewCount: 3421,
      journeyTime: 8,
      walkingTime: 2,
      changes: 0,
      nearestStation: 'Kings Cross St. Pancras',
      isPopular: true,
    },
    {
      id: '4',
      name: 'Premier Inn London Leicester Square',
      area: 'Covent Garden',
      price: 145,
      originalPrice: 199,
      rating: 4.6,
      reviewCount: 2987,
      journeyTime: 12,
      walkingTime: 4,
      changes: 1,
      nearestStation: 'Leicester Square',
    },
  ];

  const toggleFavorite = (hotelId: string) => {
    setFavorites(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  return (
    <div className="p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Hotels near Victoria Station</h2>
          <p className="text-gray-600 mt-1">4 hotels available • Sorted by best value</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <ModernHotelCard
              key={hotel.id}
              {...hotel}
              isFavorite={favorites.includes(hotel.id)}
              onToggleFavorite={() => toggleFavorite(hotel.id)}
              onSelect={() => console.log('Selected:', hotel.name)}
              onShowRoute={() => console.log('Show route for:', hotel.name)}
              onShare={() => console.log('Share:', hotel.name)}
            />
          ))}
        </div>
        
        {favorites.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">
              ❤️ You have {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const HotelGrid: Story = {
  render: () => <HotelGridContainer />,
};