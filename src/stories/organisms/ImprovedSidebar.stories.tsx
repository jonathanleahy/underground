import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StationSelector } from '@/components/atoms/StationSelector';
import { TubeLineFilter } from '@/components/molecules/TubeLineFilter';
import { HotelListItem } from '@/components/atoms/HotelListItem';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useState } from 'react';
import { 
  Hotel, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  Train,
  Settings,
  TrendingUp,
  Clock,
  Users,
  Info,
  Navigation2
} from 'lucide-react';

const ImprovedSidebar = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedStation, setSelectedStation] = useState('Victoria Station');
  const [selectedHotel, setSelectedHotel] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1]));
  const [selectedLines, setSelectedLines] = useState(new Set(['central', 'piccadilly']));
  const [showHotels, setShowHotels] = useState(true);
  const [showPrices, setShowPrices] = useState(true);
  const [autoSearch, setAutoSearch] = useState(true);

  const tubeLines = [
    { id: 'central', name: 'Central', color: '#DC241F', stations: 49 },
    { id: 'piccadilly', name: 'Piccadilly', color: '#003688', stations: 53 },
    { id: 'northern', name: 'Northern', color: '#000000', stations: 50 },
    { id: 'victoria', name: 'Victoria', color: '#0098D4', stations: 16 },
    { id: 'jubilee', name: 'Jubilee', color: '#A0A5A9', stations: 27 },
  ];

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
  ];

  const popularStations = [
    { name: 'Victoria Station', isPopular: true, journeyTime: 5 },
    { name: 'Kings Cross St. Pancras', journeyTime: 15 },
    { name: 'Oxford Circus', isPopular: true, journeyTime: 8 },
    { name: 'Paddington', journeyTime: 20 },
    { name: 'Liverpool Street', journeyTime: 18 },
    { name: 'London Bridge', isPopular: true, journeyTime: 12 },
  ];

  return (
    <div className="w-[400px] h-screen bg-white shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
            <Train className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hotel Finder</h1>
            <p className="text-indigo-100 text-sm">London Underground Network</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b h-12">
          <TabsTrigger value="search" className="data-[state=active]:bg-white rounded-none">
            <Search className="h-4 w-4 mr-1.5" />
            Search
          </TabsTrigger>
          <TabsTrigger value="hotels" className="data-[state=active]:bg-white rounded-none">
            <Hotel className="h-4 w-4 mr-1.5" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-white rounded-none">
            <MapPin className="h-4 w-4 mr-1.5" />
            Map
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white rounded-none">
            <Settings className="h-4 w-4 mr-1.5" />
            More
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Quick Search Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Navigation2 className="h-4 w-4 text-indigo-600" />
                    Quick Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5">From Station</Label>
                    <StationSelector
                      station={selectedStation}
                      onClick={() => console.log('Open station selector')}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5">Check-in Date</Label>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Tomorrow, 1 night
                      </span>
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5">Guests</Label>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        2 Adults, 0 Children
                      </span>
                    </Button>
                  </div>

                  <Separator />
                  
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search Hotels
                  </Button>
                </CardContent>
              </Card>

              {/* Popular Stations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                      Popular Stations
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Top 6
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {popularStations.map((station, index) => (
                    <StationSelector
                      key={index}
                      station={station.name}
                      variant="detailed"
                      isPopular={station.isPopular}
                      journeyTime={station.journeyTime}
                      onClick={() => setSelectedStation(station.name)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Hotels Tab */}
        <TabsContent value="hotels" className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Search Bar */}
              <SearchBar
                placeholder="Search hotels by name or area..."
                onSearch={(value) => console.log('Search:', value)}
                suggestions={['County Hall', 'Victoria', 'Kings Cross']}
              />

              {/* Results Summary */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {hotels.length} hotels near {selectedStation}
                  </Badge>
                  {favorites.size > 0 && (
                    <Badge variant="secondary">
                      {favorites.size} saved
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="ghost">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Hotel List */}
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

              {/* Load More */}
              <Button variant="outline" className="w-full">
                Load More Hotels
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Tube Lines Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tube Lines</CardTitle>
                  <CardDescription className="text-xs">
                    Select lines to display on map
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TubeLineFilter
                    lines={tubeLines}
                    selectedLines={selectedLines}
                    onLineToggle={(lineId) => {
                      const newLines = new Set(selectedLines);
                      if (newLines.has(lineId)) {
                        newLines.delete(lineId);
                      } else {
                        newLines.add(lineId);
                      }
                      setSelectedLines(newLines);
                    }}
                    variant="list"
                  />
                </CardContent>
              </Card>

              {/* Map Display Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Map Display</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-hotels" className="text-sm">Show Hotels</Label>
                    <Switch
                      id="show-hotels"
                      checked={showHotels}
                      onCheckedChange={setShowHotels}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-prices" className="text-sm">Show Prices</Label>
                    <Switch
                      id="show-prices"
                      checked={showPrices}
                      onCheckedChange={setShowPrices}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-search" className="text-sm">Auto Search</Label>
                    <Switch
                      id="auto-search"
                      checked={autoSearch}
                      onCheckedChange={setAutoSearch}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">London Hotel Finder</p>
                      <p>Find Premier Inn hotels near any London Underground station. Get real-time pricing and journey information.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version</span>
                      <span>2.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span>Today</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const meta: Meta = {
  tags: ["autodocs"],
  title: 'Organisms/ImprovedSidebar',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen bg-gray-100">
        <Story />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <MapPin className="h-32 w-32 opacity-20" />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <ImprovedSidebar />,
};