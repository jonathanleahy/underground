import type { Meta, StoryObj } from '@storybook/react';
import { PriceLabel } from '@/components/atoms/PriceLabel';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const meta: Meta<typeof PriceLabel> = {
  tags: ["autodocs"],
  title: 'Atoms/PriceLabel (Map Component)',
  component: PriceLabel,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer center={[51.5074, -0.1278]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Story />
        </MapContainer>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  args: {
    position: [51.5074, -0.1278] as [number, number],
    price: 89,
    available: true,
  },
};

export const WithDiscount: Story = {
  args: {
    position: [51.5074, -0.1278] as [number, number],
    price: 45,
    available: true,
    originalPrice: 89,
  },
};

export const WithJourneyTime: Story = {
  args: {
    position: [51.5074, -0.1278] as [number, number],
    price: 125,
    available: true,
    journeyTime: 15,
  },
};

export const SoldOut: Story = {
  args: {
    position: [51.5074, -0.1278] as [number, number],
    available: false,
  },
};

// Note: This is a map component that requires Leaflet context
export const Note: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <p>Note: PriceLabel is a Leaflet Marker component that must be used within a Map container.</p>
      <p>The examples above show how it appears on a map.</p>
      <p>For a simple price display component, use PriceBadge instead.</p>
    </div>
  ),
};