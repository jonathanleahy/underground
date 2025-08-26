import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { 
  Map,
  Train,
  Hotel,
  MapPin,
  Eye,
  EyeOff,
  Layers,
  Info
} from 'lucide-react';

const MapLegend = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    stations: true,
    hotels: true,
    routes: true,
  });

  const tubeLines = [
    { name: 'Central', color: '#DC241F' },
    { name: 'Piccadilly', color: '#003688' },
    { name: 'Victoria', color: '#0098D4' },
    { name: 'Northern', color: '#000000' },
    { name: 'Jubilee', color: '#A0A5A9' },
  ];

  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <Card className={`shadow-lg transition-all ${isCollapsed ? 'w-12' : 'w-64'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="h-4 w-4 text-indigo-600" />
              Map Legend
            </CardTitle>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <Layers className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Tube Lines */}
          <div>
            <h4 className="text-sm font-medium mb-2">Tube Lines</h4>
            <div className="space-y-1">
              {tubeLines.map((line) => (
                <div key={line.name} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-1 rounded-full" 
                    style={{ backgroundColor: line.color }}
                  />
                  <span className="text-xs">{line.name} Line</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Symbols */}
          <div>
            <h4 className="text-sm font-medium mb-2">Map Symbols</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white border-2 border-gray-600 rounded-full"></div>
                  <span className="text-xs">Tube Station</span>
                </div>
                <button
                  onClick={() => toggleLayer('stations')}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  {visibleLayers.stations ? (
                    <Eye className="h-3 w-3 text-gray-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
                    <Hotel className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-xs">Premier Inn</span>
                </div>
                <button
                  onClick={() => toggleLayer('hotels')}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  {visibleLayers.hotels ? (
                    <Eye className="h-3 w-3 text-gray-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-xs">Your Location</span>
                </div>
                <button
                  onClick={() => toggleLayer('routes')}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  {visibleLayers.routes ? (
                    <Eye className="h-3 w-3 text-gray-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Journey Times */}
          <div>
            <h4 className="text-sm font-medium mb-2">Journey Times</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Quick
                </span>
                <span className="text-gray-500">&lt; 15 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Moderate
                </span>
                <span className="text-gray-500">15-30 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Long
                </span>
                <span className="text-gray-500">&gt; 30 min</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Info className="h-3 w-3 mt-0.5" />
              <span>Click on any hotel or station for details</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const meta: Meta = {
  tags: ["autodocs"],
  title: 'Organisms/MapLegend',
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
  render: () => <MapLegend />,
};

export const Collapsed: Story = {
  render: () => {
    const CollapsedLegend = () => {
      const [isCollapsed] = useState(true);
      return <MapLegend />;
    };
    return <CollapsedLegend />;
  },
};