import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { 
  Filter,
  Clock,
  Wallet,
  Star,
  Users,
  Wifi,
  Coffee,
  Car,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

const FilterPanel = () => {
  const [journeyTime, setJourneyTime] = useState([0, 45]);
  const [priceRange, setPriceRange] = useState([50, 150]);
  const [rating, setRating] = useState([3.5]);
  const [amenities, setAmenities] = useState({
    wifi: true,
    breakfast: false,
    parking: false,
    bar: false,
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState(3);

  const resetFilters = () => {
    setJourneyTime([0, 45]);
    setPriceRange([50, 150]);
    setRating([3.5]);
    setAmenities({ wifi: true, breakfast: false, parking: false, bar: false });
  };

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-600" />
            Filters
            {activeFilters > 0 && (
              <Badge className="bg-indigo-600 text-white">{activeFilters}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Journey Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Journey Time
              </Label>
              <span className="text-sm text-gray-600">
                {journeyTime[0]}-{journeyTime[1]} min
              </span>
            </div>
            <Slider
              value={journeyTime}
              onValueChange={setJourneyTime}
              min={0}
              max={90}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 min</span>
              <span>90 min</span>
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-gray-500" />
                Price per Night
              </Label>
              <span className="text-sm text-gray-600">
                £{priceRange[0]}-£{priceRange[1]}
              </span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={30}
              max={300}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>£30</span>
              <span>£300</span>
            </div>
          </div>

          <Separator />

          {/* Star Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-gray-500" />
                Minimum Rating
              </Label>
              <span className="text-sm text-gray-600">
                {rating[0]}+ stars
              </span>
            </div>
            <Slider
              value={rating}
              onValueChange={setRating}
              min={3}
              max={5}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3.0</span>
              <span>5.0</span>
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Amenities</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="wifi" className="text-sm font-normal">Free WiFi</Label>
                </div>
                <Switch
                  id="wifi"
                  checked={amenities.wifi}
                  onCheckedChange={(checked) => setAmenities({...amenities, wifi: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="breakfast" className="text-sm font-normal">Breakfast</Label>
                </div>
                <Switch
                  id="breakfast"
                  checked={amenities.breakfast}
                  onCheckedChange={(checked) => setAmenities({...amenities, breakfast: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="parking" className="text-sm font-normal">Parking</Label>
                </div>
                <Switch
                  id="parking"
                  checked={amenities.parking}
                  onCheckedChange={(checked) => setAmenities({...amenities, parking: checked})}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Apply Button */}
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            Apply Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

const meta: Meta = {
  tags: ["autodocs"],
  title: 'Organisms/FilterPanel',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <FilterPanel />,
};