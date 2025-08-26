import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { HotelCard } from '@/components/molecules/HotelCard';
import { PriceBadge } from '@/components/atoms/PriceBadge';
import { SimplePriceLabel } from '@/components/atoms/SimplePriceLabel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { MapPin, Filter, SortAsc } from 'lucide-react';

import { ModernHotelCard } from '@/components/molecules/ModernHotelCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, ChevronDown, Grid2x2, List, Star } from 'lucide-react';

// Full page template using composition
const HotelListingTemplate = () => {
  const [selectedStation, setSelectedStation] = useState('Victoria');
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'budget' | 'mid' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating'>('price');

  const hotels = [
    {
      id: '1',
      name: 'Premier Inn London Victoria',
      area: 'Victoria',
      price: 89,
      journeyTime: 5,
      walkingTime: 2,
      changes: 0,
      nearestStation: 'Victoria',
      originalPrice: 120,
    },
    {
      id: '2',
      name: 'Premier Inn London County Hall',
      area: 'Waterloo',
      price: 99,
      journeyTime: 10,
      walkingTime: 5,
      changes: 1,
      nearestStation: 'Waterloo',
    },
    {
      id: '3',
      name: 'Premier Inn London Kings Cross',
      area: 'Kings Cross',
      price: 125,
      journeyTime: 12,
      walkingTime: 3,
      changes: 0,
      nearestStation: 'Kings Cross St. Pancras',
    },
    {
      id: '4',
      name: 'Premier Inn London Leicester Square',
      area: 'Covent Garden',
      price: 145,
      journeyTime: 8,
      walkingTime: 4,
      changes: 0,
      nearestStation: 'Leicester Square',
    },
  ];

  const filteredHotels = hotels.filter(hotel => {
    if (priceFilter === 'budget') return hotel.price < 90;
    if (priceFilter === 'mid') return hotel.price >= 90 && hotel.price < 120;
    if (priceFilter === 'premium') return hotel.price >= 120;
    return true;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'distance') return a.journeyTime - b.journeyTime;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                London Underground Hotel Finder
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Find the perfect Premier Inn near any tube station
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {sortedHotels.length} Hotels Available
            </Badge>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search for a tube station..."
                onSearch={setSelectedStation}
                suggestions={[
                  'Victoria',
                  'Kings Cross',
                  'Paddington',
                  'Liverpool Street',
                  'Waterloo',
                ]}
              />
            </div>
            
            <div className="flex gap-2">
              {/* Price Filter */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={priceFilter === 'all' ? 'default' : 'ghost'}
                  onClick={() => setPriceFilter('all')}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={priceFilter === 'budget' ? 'default' : 'ghost'}
                  onClick={() => setPriceFilter('budget')}
                >
                  £0-90
                </Button>
                <Button
                  size="sm"
                  variant={priceFilter === 'mid' ? 'default' : 'ghost'}
                  onClick={() => setPriceFilter('mid')}
                >
                  £90-120
                </Button>
                <Button
                  size="sm"
                  variant={priceFilter === 'premium' ? 'default' : 'ghost'}
                  onClick={() => setPriceFilter('premium')}
                >
                  £120+
                </Button>
              </div>

              {/* Sort */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const options: Array<'price' | 'distance' | 'rating'> = ['price', 'distance', 'rating'];
                  const currentIndex = options.indexOf(sortBy);
                  setSortBy(options[(currentIndex + 1) % options.length]);
                }}
              >
                <SortAsc className="h-4 w-4 mr-1" />
                Sort: {sortBy}
              </Button>
            </div>
          </div>

          {/* Current Search Info */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>From: <strong>{selectedStation}</strong></span>
            </div>
            <div className="flex gap-2">
              <SimplePriceLabel price={89} originalPrice={120} />
              <span className="text-sm text-gray-600">Best Deal Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotel List */}
          <div className="lg:col-span-2 space-y-4">
            {sortedHotels.map((hotel) => (
              <div key={hotel.id} className="relative">
                {hotel.originalPrice && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <PriceBadge 
                      price={Math.round(((hotel.originalPrice - hotel.price) / hotel.originalPrice) * 100)} 
                      variant="discount"
                      size="sm"
                    />
                  </div>
                )}
                <HotelCard
                  {...hotel}
                  isHighlighted={selectedHotel === hotel.id}
                  onSelect={() => setSelectedHotel(hotel.id)}
                  onShowRoute={() => console.log('Show route for', hotel.name)}
                />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Summary Card */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Search Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Station:</span>
                  <span className="font-medium">{selectedStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotels Found:</span>
                  <span className="font-medium">{sortedHotels.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Price:</span>
                  <span className="font-medium">
                    £{Math.round(sortedHotels.reduce((acc, h) => acc + h.price, 0) / sortedHotels.length)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Closest:</span>
                  <span className="font-medium">
                    {Math.min(...sortedHotels.map(h => h.journeyTime))} min
                  </span>
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Travel Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Off-peak hours: 9:30am - 4:00pm</li>
                <li>• Use contactless for best fares</li>
                <li>• Daily cap applies after 3 journeys</li>
                <li>• Night tube runs Fri-Sat</li>
              </ul>
            </Card>

            {/* Quick Filters */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Filters</h3>
              <div className="space-y-2">
                <Badge 
                  className="cursor-pointer hover:bg-secondary" 
                  variant="outline"
                >
                  Direct Journey Only
                </Badge>
                <Badge 
                  className="cursor-pointer hover:bg-secondary" 
                  variant="outline"
                >
                  Walk &lt; 5 min
                </Badge>
                <Badge 
                  className="cursor-pointer hover:bg-secondary" 
                  variant="outline"
                >
                  Special Offers
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const meta: Meta = {
  tags: ["autodocs"],
  title: 'Templates/HotelListingPage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <HotelListingTemplate />,
};