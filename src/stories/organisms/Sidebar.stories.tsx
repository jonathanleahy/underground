import type { Meta, StoryObj } from '@storybook/react';
import { SimplifiedSidebar } from '@/components/SimplifiedSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { 
  Hotel, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  Train,
  Navigation,
  Settings,
  ChevronRight
} from 'lucide-react';

// Modern Sidebar Component
const ModernSidebar = ({
  stations = [],
  hotels = [],
  hotelPricing = new Map(),
  onSelectHotel,
  onShowRoute,
  showHotels,
  setShowHotels,
  showPricesOnMap,
  setShowPricesOnMap,
}) => {
  const [activeTab, setActiveTab] = useState('hotels');
  const [selectedLines, setSelectedLines] = useState(new Set(['central', 'piccadilly']));

  const tubeLines = [
    { id: 'central', name: 'Central', color: '#DC241F' },
    { id: 'piccadilly', name: 'Piccadilly', color: '#003688' },
    { id: 'northern', name: 'Northern', color: '#000000' },
    { id: 'victoria', name: 'Victoria', color: '#0098D4' },
    { id: 'jubilee', name: 'Jubilee', color: '#A0A5A9' },
  ];

  return (
    <div className="w-96 h-full bg-white shadow-xl flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Train className="h-6 w-6" />
          London Hotel Finder
        </h2>
        <p className="text-indigo-100 mt-1">Find Premier Inn hotels near any tube station</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 p-1">
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Explore
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Hotels Tab */}
        <TabsContent value="hotels" className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-between" variant="outline">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Victoria Station
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tomorrow, 1 night
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Search className="h-4 w-4 mr-2" />
                  Search Hotels
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Nearby Hotels
                <Badge variant="secondary">4 found</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hotels.slice(0, 4).map((hotel, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectHotel?.(hotel)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{hotel.name || `Hotel ${index + 1}`}</h4>
                      <p className="text-xs text-gray-600">0.5 miles • 8 min walk</p>
                    </div>
                    <Badge variant="secondary">£89</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowRoute?.('current', hotel.name);
                    }}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Show Route
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explore Tab */}
        <TabsContent value="explore" className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tube Lines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tubeLines.map((line) => (
                <div key={line.id} className="flex items-center justify-between">
                  <Label 
                    htmlFor={line.id} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: line.color }}
                    />
                    {line.name} Line
                  </Label>
                  <Switch
                    id={line.id}
                    checked={selectedLines.has(line.id)}
                    onCheckedChange={(checked) => {
                      const newLines = new Set(selectedLines);
                      if (checked) {
                        newLines.add(line.id);
                      } else {
                        newLines.delete(line.id);
                      }
                      setSelectedLines(newLines);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Popular Stations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {['Kings Cross', 'Victoria', 'Paddington', 'Liverpool St'].map((station) => (
                <Button
                  key={station}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {station}
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Map Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-hotels">Show Hotels</Label>
                <Switch
                  id="show-hotels"
                  checked={showHotels}
                  onCheckedChange={setShowHotels}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-prices">Show Prices</Label>
                <Switch
                  id="show-prices"
                  checked={showPricesOnMap}
                  onCheckedChange={setShowPricesOnMap}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-routes">Show Routes</Label>
                <Switch id="show-routes" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Notifications</Label>
                <Switch id="notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-search">Auto Search</Label>
                <Switch id="auto-search" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const meta: Meta<typeof SimplifiedSidebar> = {
  tags: ["autodocs"],
  title: 'Organisms/Sidebar',
  component: SimplifiedSidebar,
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
type Story = StoryObj<typeof meta>;


export const Default: Story = {
  args: {
    stations: [],
    hotels: [
      { name: 'Premier Inn London County Hall' },
      { name: 'Premier Inn Victoria' },
      { name: 'Premier Inn Kings Cross' },
      { name: 'Premier Inn Paddington' },
    ],
    hotelPricing: new Map(),
    selectedDate: null,
    onDateChange: () => {},
    onSearchPrices: () => {},
    onSelectHotel: (hotel) => console.log('Selected hotel:', hotel),
    onShowRoute: (from, to) => console.log('Show route:', from, to),
    showHotels: true,
    setShowHotels: () => {},
    showPricesOnMap: true,
    setShowPricesOnMap: () => {},
    lines: [],
    selectedLines: new Set(),
    onLineToggle: () => {},
  },
};

export const ModernVersion: Story = {
  render: () => {
    const [showHotels, setShowHotels] = useState(true);
    const [showPricesOnMap, setShowPricesOnMap] = useState(true);

    return (
      <ModernSidebar
        stations={[]}
        hotels={[
          { name: 'Premier Inn London County Hall' },
          { name: 'Premier Inn Victoria' },
          { name: 'Premier Inn Kings Cross' },
          { name: 'Premier Inn Paddington' },
        ]}
        hotelPricing={new Map()}
        onSelectHotel={(hotel) => console.log('Selected:', hotel)}
        onShowRoute={(from, to) => console.log('Route:', from, to)}
        showHotels={showHotels}
        setShowHotels={setShowHotels}
        showPricesOnMap={showPricesOnMap}
        setShowPricesOnMap={setShowPricesOnMap}
      />
    );
  },
};