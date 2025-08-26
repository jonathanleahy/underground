import type { Meta, StoryObj } from '@storybook/react';
import { StationSelector } from '@/components/atoms/StationSelector';

const meta: Meta<typeof StationSelector> = {
  tags: ["autodocs"],
  title: 'Atoms/StationSelector',
  component: StationSelector,
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

export const Default: Story = {
  args: {
    station: 'Victoria Station',
    onClick: () => console.log('Station clicked'),
  },
};

export const Compact: Story = {
  args: {
    station: 'Kings Cross',
    variant: 'compact',
    onClick: () => console.log('Station clicked'),
  },
};

export const Detailed: Story = {
  args: {
    station: 'Oxford Circus',
    variant: 'detailed',
    isPopular: true,
    journeyTime: 12,
    onClick: () => console.log('Station clicked'),
  },
};

export const DetailedList: Story = {
  render: () => (
    <div className="space-y-3">
      <StationSelector
        station="Victoria Station"
        variant="detailed"
        isPopular={true}
        journeyTime={5}
        onClick={() => console.log('Victoria')}
      />
      <StationSelector
        station="Kings Cross St. Pancras"
        variant="detailed"
        journeyTime={15}
        onClick={() => console.log('Kings Cross')}
      />
      <StationSelector
        station="Oxford Circus"
        variant="detailed"
        isPopular={true}
        journeyTime={8}
        onClick={() => console.log('Oxford Circus')}
      />
      <StationSelector
        station="Paddington"
        variant="detailed"
        journeyTime={20}
        onClick={() => console.log('Paddington')}
      />
    </div>
  ),
};