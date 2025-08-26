import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '@/components/molecules/SearchBar';

const meta = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
  },
  
  argTypes: {
    placeholder: { control: 'text' },
    onSearch: { action: 'searched' },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter postcode or destination',
  },
};

export const WithSuggestions: Story = {
  args: {
    placeholder: 'Enter postcode or destination',
    suggestions: [
      'SW1A 1AA - Westminster',
      'EC2M 4NS - City of London',
      'E14 5AB - Canary Wharf',
      'N1C 4TB - King\'s Cross',
      'W1D 1BS - Oxford Street',
      'SE1 9PX - South Bank',
    ],
  },
};

export const LandmarkSuggestions: Story = {
  args: {
    placeholder: 'Search for a landmark',
    suggestions: [
      'British Museum',
      'Tower of London',
      'Buckingham Palace',
      'London Eye',
      'Big Ben',
      'The Shard',
      'Covent Garden',
      'Camden Market',
    ],
  },
};

export const StationSearch: Story = {
  args: {
    placeholder: 'Enter station name',
    suggestions: [
      'Victoria Station',
      'King\'s Cross St. Pancras',
      'Liverpool Street',
      'Paddington',
      'Waterloo',
      'London Bridge',
      'Oxford Circus',
      'Bank',
    ],
  },
};