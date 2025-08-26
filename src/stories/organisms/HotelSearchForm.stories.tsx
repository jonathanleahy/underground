import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { HotelCard } from '@/components/molecules/HotelCard';
import { PriceBadge } from '@/components/atoms/PriceBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// Presenter Component
const HotelSearchPresenter = ({
  hotels,
  onSearch,
  onSelectHotel,
  onShowRoute,
  selectedHotel,
  searchValue
}: {
  hotels: any[];
  onSearch: (value: string) => void;
  onSelectHotel: (hotel: any) => void;
  onShowRoute: (hotel: any) => void;
  selectedHotel: any | null;
  searchValue: string;
}) => {
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Find Hotels Near London Tube Stations</h1>
        <SearchBar
          placeholder="Enter a tube station name"
          onSearch={onSearch}
          suggestions={[
            'Kings Cross',
            'Victoria',
            'Paddington',
            'Liverpool Street',
            'Waterloo'
          ]}
        />
      </div>

      {searchValue && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing hotels near <strong>{searchValue}</strong>
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary">{hotels.length} hotels found</Badge>
            <PriceBadge price={89} variant="discount" size="sm" />
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            {...hotel}
            isHighlighted={selectedHotel?.id === hotel.id}
            onSelect={() => onSelectHotel(hotel)}
            onShowRoute={() => onShowRoute(hotel)}
          />
        ))}
      </div>
    </div>
  );
};

// Container Component
const HotelSearchContainer = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [routeHotel, setRouteHotel] = useState<any | null>(null);

  // Mock data - in real app this would come from API
  const mockHotels = [
    {
      id: '1',
      name: 'Premier Inn London County Hall',
      area: 'Waterloo',
      price: 89,
      journeyTime: 5,
      walkingTime: 2,
      changes: 0,
      nearestStation: 'Waterloo'
    },
    {
      id: '2',
      name: 'Premier Inn London Victoria',
      area: 'Victoria',
      price: 99,
      journeyTime: 8,
      walkingTime: 3,
      changes: 0,
      nearestStation: 'Victoria'
    },
    {
      id: '3',
      name: 'Premier Inn London Kings Cross',
      area: 'Kings Cross',
      price: 125,
      journeyTime: 12,
      walkingTime: 5,
      changes: 1,
      nearestStation: 'Kings Cross St. Pancras'
    },
    {
      id: '4',
      name: 'Premier Inn London Paddington',
      area: 'Paddington',
      price: 115,
      journeyTime: 15,
      walkingTime: 7,
      changes: 1,
      nearestStation: 'Paddington'
    }
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // In real app, would fetch hotels based on search
  };

  const filteredHotels = searchValue
    ? mockHotels.filter(h => 
        h.nearestStation.toLowerCase().includes(searchValue.toLowerCase()) ||
        h.area.toLowerCase().includes(searchValue.toLowerCase())
      )
    : mockHotels;

  return (
    <div>
      <HotelSearchPresenter
        hotels={filteredHotels}
        onSearch={handleSearch}
        onSelectHotel={setSelectedHotel}
        onShowRoute={setRouteHotel}
        selectedHotel={selectedHotel}
        searchValue={searchValue}
      />
      
      {routeHotel && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg">
          <p className="text-sm">
            Showing route to: <strong>{routeHotel.name}</strong>
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setRouteHotel(null)}
            className="mt-2"
          >
            Clear Route
          </Button>
        </div>
      )}
    </div>
  );
};

const meta: Meta = {
  tags: ["autodocs"],
  title: 'Organisms/HotelSearchForm',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <HotelSearchContainer />,
};

// Static presenter with mock data
export const WithResults: Story = {
  render: () => (
    <HotelSearchPresenter
      hotels={[
        {
          id: '1',
          name: 'Premier Inn London County Hall',
          area: 'Waterloo',
          price: 89,
          journeyTime: 5,
          walkingTime: 2,
          changes: 0,
          nearestStation: 'Waterloo'
        },
        {
          id: '2',
          name: 'Premier Inn London Victoria',
          area: 'Victoria',
          price: 99,
          journeyTime: 8,
          walkingTime: 3,
          changes: 0,
          nearestStation: 'Victoria'
        }
      ]}
      onSearch={(value) => console.log('Search:', value)}
      onSelectHotel={(hotel) => console.log('Selected:', hotel)}
      onShowRoute={(hotel) => console.log('Show route:', hotel)}
      selectedHotel={null}
      searchValue="Victoria"
    />
  ),
};

// Empty state
export const NoResults: Story = {
  render: () => (
    <HotelSearchPresenter
      hotels={[]}
      onSearch={(value) => console.log('Search:', value)}
      onSelectHotel={(hotel) => console.log('Selected:', hotel)}
      onShowRoute={(hotel) => console.log('Show route:', hotel)}
      selectedHotel={null}
      searchValue="Nowhere Station"
    />
  ),
};