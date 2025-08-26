import type { Meta, StoryObj } from '@storybook/react';
import { PriceFilter } from '@/components/PriceFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { PoundSterling, TrendingDown, Sparkles } from 'lucide-react';

// Modern Price Filter Component
const ModernPriceFilter = ({
  minPrice = 0,
  maxPrice = 300,
  onFilterChange,
  hotelCount = 45,
  filteredCount = 28,
}) => {
  const [range, setRange] = useState<[number, number]>([minPrice, maxPrice]);

  const handleRangeChange = (values: number[]) => {
    setRange([values[0], values[1]]);
    onFilterChange?.(values[0], values[1]);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PoundSterling className="h-4 w-4 text-indigo-600" />
            Price Range
          </span>
          <Badge variant="secondary">
            {filteredCount} of {hotelCount} hotels
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Min</span>
            <span className="font-bold text-lg">£{range[0]}</span>
          </div>
          <div className="flex-1 px-4">
            <Slider
              value={range}
              onValueChange={handleRangeChange}
              min={minPrice}
              max={maxPrice}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-gray-500">Max</span>
            <span className="font-bold text-lg">£{range[1]}</span>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => handleRangeChange([0, 50])}
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            Budget (£0-50)
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => handleRangeChange([50, 100])}
          >
            Mid-range (£50-100)
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => handleRangeChange([100, 300])}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Premium (£100+)
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

const meta: Meta<typeof PriceFilter> = {
  tags: ["autodocs"],
  title: 'Molecules/PriceFilter',
  component: PriceFilter,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    minPrice: 0,
    maxPrice: 200,
    hotelCount: 45,
    filteredCount: 45,
    onFilterChange: (min, max) => {
      console.log(`Filter changed: £${min} - £${max}`);
    },
  },
};

export const WithActiveFilter: Story = {
  args: {
    minPrice: 50,
    maxPrice: 150,
    hotelCount: 45,
    filteredCount: 28,
    onFilterChange: (min, max) => {
      console.log(`Filter changed: £${min} - £${max}`);
    },
  },
};

export const ModernVersion: Story = {
  render: () => (
    <ModernPriceFilter
      minPrice={0}
      maxPrice={300}
      hotelCount={45}
      filteredCount={28}
      onFilterChange={(min, max) => console.log(`Price range: £${min} - £${max}`)}
    />
  ),
};

// Container with state management
const PriceFilterContainer = () => {
  const [filters, setFilters] = useState({
    price: [0, 200],
    rating: [0, 5],
    distance: [0, 30],
  });
  
  const hotels = [
    { id: 1, name: 'Budget Inn', price: 45 },
    { id: 2, name: 'Comfort Hotel', price: 89 },
    { id: 3, name: 'Luxury Suite', price: 189 },
    { id: 4, name: 'Premium Lodge', price: 145 },
    { id: 5, name: 'Economy Stay', price: 35 },
  ];
  
  const filteredHotels = hotels.filter(
    h => h.price >= filters.price[0] && h.price <= filters.price[1]
  );

  return (
    <div className="space-y-6">
      <ModernPriceFilter
        minPrice={0}
        maxPrice={200}
        hotelCount={hotels.length}
        filteredCount={filteredHotels.length}
        onFilterChange={(min, max) => setFilters(prev => ({ ...prev, price: [min, max] }))}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtered Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredHotels.map(hotel => (
              <div key={hotel.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{hotel.name}</span>
                <Badge variant="secondary">£{hotel.price}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const WithResults: Story = {
  render: () => <PriceFilterContainer />,
};