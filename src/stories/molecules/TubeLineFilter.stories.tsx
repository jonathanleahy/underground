import type { Meta, StoryObj } from '@storybook/react';
import { TubeLineFilter } from '@/components/molecules/TubeLineFilter';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const meta: Meta<typeof TubeLineFilter> = {
  tags: ["autodocs"],
  title: 'Molecules/TubeLineFilter',
  component: TubeLineFilter,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-6 bg-gray-50">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const tubeLines = [
  { id: 'central', name: 'Central', color: '#DC241F', stations: 49 },
  { id: 'piccadilly', name: 'Piccadilly', color: '#003688', stations: 53 },
  { id: 'northern', name: 'Northern', color: '#000000', stations: 50 },
  { id: 'victoria', name: 'Victoria', color: '#0098D4', stations: 16 },
  { id: 'jubilee', name: 'Jubilee', color: '#A0A5A9', stations: 27 },
  { id: 'district', name: 'District', color: '#00782A', stations: 60 },
  { id: 'circle', name: 'Circle', color: '#FFD300', stations: 36 },
  { id: 'metropolitan', name: 'Metropolitan', color: '#9B0056', stations: 34 },
];

export const ListVariant: Story = {
  render: () => {
    const [selectedLines, setSelectedLines] = useState(new Set(['central', 'piccadilly']));
    
    return (
      <TubeLineFilter
        lines={tubeLines.slice(0, 5)}
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
        showStationCount={true}
      />
    );
  },
};

export const ChipsVariant: Story = {
  render: () => {
    const [selectedLines, setSelectedLines] = useState(new Set(['central', 'victoria']));
    
    return (
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
        variant="chips"
      />
    );
  },
};

export const GridVariant: Story = {
  render: () => {
    const [selectedLines, setSelectedLines] = useState(new Set(['northern']));
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Select Tube Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <TubeLineFilter
            lines={tubeLines.slice(0, 6)}
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
            variant="grid"
            showStationCount={true}
          />
        </CardContent>
      </Card>
    );
  },
};