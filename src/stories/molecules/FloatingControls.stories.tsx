import type { Meta, StoryObj } from '@storybook/react';
import { FloatingControls } from '@/components/FloatingControls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Map, 
  Layers, 
  Menu,
  X,
  Navigation,
  Maximize2
} from 'lucide-react';

// Modern Floating Controls Component
const ModernFloatingControls = ({
  onToggleSidebar,
  sidebarVisible,
  onZoomIn,
  onZoomOut,
  onResetView,
  mapType,
  onMapTypeChange,
}) => {
  const [showMapOptions, setShowMapOptions] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
      {/* Map Type Selector */}
      <div className="relative">
        {showMapOptions && (
          <Card className="absolute bottom-full right-0 mb-2 p-2 min-w-[150px] shadow-lg">
            <div className="space-y-1">
              <button
                onClick={() => {
                  onMapTypeChange('street');
                  setShowMapOptions(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2 ${
                  mapType === 'street' ? 'bg-indigo-50 text-indigo-600' : ''
                }`}
              >
                <Map className="h-4 w-4" />
                Street Map
              </button>
              <button
                onClick={() => {
                  onMapTypeChange('dark');
                  setShowMapOptions(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2 ${
                  mapType === 'dark' ? 'bg-indigo-50 text-indigo-600' : ''
                }`}
              >
                <Layers className="h-4 w-4" />
                Dark Mode
              </button>
              <button
                onClick={() => {
                  onMapTypeChange('satellite');
                  setShowMapOptions(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2 ${
                  mapType === 'satellite' ? 'bg-indigo-50 text-indigo-600' : ''
                }`}
              >
                <Navigation className="h-4 w-4" />
                Satellite
              </button>
            </div>
          </Card>
        )}
        
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg bg-white hover:bg-gray-100"
          onClick={() => setShowMapOptions(!showMapOptions)}
        >
          <Layers className="h-5 w-5" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <Card className="p-1 shadow-lg">
        <div className="flex flex-col">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-none rounded-t-md"
            onClick={onZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <div className="h-px bg-gray-200" />
          <Button
            size="icon"
            variant="ghost"
            className="rounded-none"
            onClick={onResetView}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <div className="h-px bg-gray-200" />
          <Button
            size="icon"
            variant="ghost"
            className="rounded-none rounded-b-md"
            onClick={onZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Toggle Sidebar */}
      <Button
        size="icon"
        className="rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={onToggleSidebar}
      >
        {sidebarVisible ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>
  );
};

const meta: Meta<typeof FloatingControls> = {
  tags: ["autodocs"],
  title: 'Molecules/FloatingControls',
  component: FloatingControls,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="relative min-h-[500px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <Map className="h-32 w-32 opacity-20" />
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sidebarVisible: false,
    mapType: 'street',
    onToggleSidebar: () => console.log('Toggle sidebar'),
    onZoomIn: () => console.log('Zoom in'),
    onZoomOut: () => console.log('Zoom out'),
    onResetView: () => console.log('Reset view'),
    onMapTypeChange: (type) => console.log('Map type:', type),
  },
};

export const SidebarVisible: Story = {
  args: {
    sidebarVisible: true,
    mapType: 'street',
    onToggleSidebar: () => console.log('Toggle sidebar'),
    onZoomIn: () => console.log('Zoom in'),
    onZoomOut: () => console.log('Zoom out'),
    onResetView: () => console.log('Reset view'),
    onMapTypeChange: (type) => console.log('Map type:', type),
  },
};

export const ModernStyle: Story = {
  render: () => {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [mapType, setMapType] = useState<'street' | 'dark' | 'satellite'>('street');
    const [zoomLevel, setZoomLevel] = useState(10);

    return (
      <div className="relative">
        <ModernFloatingControls
          sidebarVisible={sidebarVisible}
          mapType={mapType}
          onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          onZoomIn={() => setZoomLevel(Math.min(20, zoomLevel + 1))}
          onZoomOut={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
          onResetView={() => setZoomLevel(10)}
          onMapTypeChange={setMapType}
        />
        
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-semibold mb-2">Map Status</h3>
          <div className="space-y-1 text-sm">
            <div>Sidebar: {sidebarVisible ? 'Visible' : 'Hidden'}</div>
            <div>Map Type: {mapType}</div>
            <div>Zoom Level: {zoomLevel}</div>
          </div>
        </div>
      </div>
    );
  },
};