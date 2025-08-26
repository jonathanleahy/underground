import type { Meta, StoryObj } from '@storybook/react';
import { RoutePlanner } from '@/components/RoutePlanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { 
  Navigation, 
  ArrowRightLeft, 
  MapPin, 
  Train,
  Clock,
  Route,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

// Modern Route Planner Component
const ModernRoutePlanner = () => {
  const [fromStation, setFromStation] = useState('victoria');
  const [toStation, setToStation] = useState('kings-cross');
  const [route, setRoute] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const stations = [
    { id: 'victoria', name: 'Victoria', zone: 1 },
    { id: 'kings-cross', name: 'Kings Cross St. Pancras', zone: 1 },
    { id: 'oxford-circus', name: 'Oxford Circus', zone: 1 },
    { id: 'paddington', name: 'Paddington', zone: 1 },
    { id: 'waterloo', name: 'Waterloo', zone: 1 },
    { id: 'london-bridge', name: 'London Bridge', zone: 1 },
    { id: 'liverpool-street', name: 'Liverpool Street', zone: 1 },
    { id: 'euston', name: 'Euston', zone: 1 },
    { id: 'bank', name: 'Bank', zone: 1 },
    { id: 'canary-wharf', name: 'Canary Wharf', zone: 2 },
  ];

  const mockRoute = {
    totalTime: 12,
    changes: 1,
    segments: [
      {
        line: 'Victoria Line',
        color: '#0098D4',
        from: 'Victoria',
        to: 'Oxford Circus',
        duration: 3,
        stops: 2,
      },
      {
        line: 'Central Line',
        color: '#DC241F',
        from: 'Oxford Circus',
        to: 'Tottenham Court Road',
        duration: 2,
        stops: 1,
      },
      {
        line: 'Northern Line',
        color: '#000000',
        from: 'Tottenham Court Road',
        to: 'Kings Cross St. Pancras',
        duration: 5,
        stops: 3,
      },
    ],
  };

  const handleFindRoute = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setRoute(mockRoute);
      setIsCalculating(false);
    }, 1000);
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Route Planner Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-xl flex items-center gap-2">
            <Route className="h-5 w-5" />
            Journey Planner
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Find the fastest route between stations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* From Station */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              From Station
            </label>
            <Select value={fromStation} onValueChange={setFromStation}>
              <SelectTrigger>
                <SelectValue placeholder="Select starting station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{station.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        Zone {station.zone}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleSwapStations}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* To Station */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              To Station
            </label>
            <Select value={toStation} onValueChange={setToStation}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{station.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        Zone {station.zone}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleFindRoute}
              disabled={isCalculating || fromStation === toStation}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Find Route
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setRoute(null)}
              disabled={!route}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route Results */}
      {route && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Route Found
              </span>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {route.totalTime} min
                </Badge>
                <Badge variant="outline">
                  {route.changes} change{route.changes !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {route.segments.map((segment: any, index: number) => (
                <div key={index}>
                  {index > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Change at {segment.from}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: segment.color }}
                      >
                        {index + 1}
                      </div>
                      {index < route.segments.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-300 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm" style={{ color: segment.color }}>
                        {segment.line}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {segment.from} → {segment.to}
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>{segment.duration} min</span>
                        <span>{segment.stops} stops</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total journey time:</span>
              <span className="font-bold">{route.totalTime} minutes</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Routes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            Popular Routes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { from: 'Victoria', to: 'Kings Cross', time: 12 },
            { from: 'Paddington', to: 'Liverpool Street', time: 18 },
            { from: 'Waterloo', to: 'Canary Wharf', time: 15 },
          ].map((route, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-between text-sm"
              onClick={() => {
                setFromStation(route.from.toLowerCase().replace(' ', '-'));
                setToStation(route.to.toLowerCase().replace(' ', '-'));
              }}
            >
              <span className="flex items-center gap-2">
                <Train className="h-4 w-4 text-gray-400" />
                {route.from} → {route.to}
              </span>
              <Badge variant="secondary" className="text-xs">
                {route.time} min
              </Badge>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const meta: Meta<typeof RoutePlanner> = {
  tags: ["autodocs"],
  title: 'Organisms/RoutePlanner',
  component: RoutePlanner,
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
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onRouteFound: (route) => console.log('Route found:', route),
    onStationHighlight: (stationId) => console.log('Highlight station:', stationId),
  },
};

export const Modern: Story = {
  render: () => <ModernRoutePlanner />,
};