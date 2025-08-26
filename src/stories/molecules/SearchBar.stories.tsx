import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useState } from 'react';

const meta: Meta<typeof SearchBar> = {
  tags: ["autodocs"],
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic presenter component
export const Default: Story = {
  args: {
    placeholder: 'Enter postcode or destination',
    onSearch: (value: string) => console.log('Searching for:', value),
  },
};

// With suggestions
export const WithSuggestions: Story = {
  args: {
    placeholder: 'Enter a London station',
    suggestions: [
      'King\'s Cross St. Pancras',
      'Oxford Circus',
      'Piccadilly Circus',
      'Westminster',
      'London Bridge',
      'Victoria',
      'Paddington',
      'Liverpool Street',
    ],
    onSearch: (value: string) => console.log('Searching for:', value),
  },
};

// Container component pattern - manages its own state
const SearchBarContainer = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [lastSearch, setLastSearch] = useState<string>('');

  const handleSearch = (value: string) => {
    setLastSearch(value);
    setSearchHistory(prev => [...prev, value]);
  };

  return (
    <div className="space-y-4">
      <SearchBar
        placeholder="Search for a location"
        onSearch={handleSearch}
        suggestions={searchHistory}
      />
      {lastSearch && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Last search:</p>
          <p className="font-medium">{lastSearch}</p>
        </div>
      )}
      {searchHistory.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Search History:</p>
          <ul className="space-y-1">
            {searchHistory.map((item, index) => (
              <li key={index} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const WithContainer: Story = {
  render: () => <SearchBarContainer />,
};

// Composition with other components
export const SearchBarWithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Find your nearest Premier Inn
      </label>
      <SearchBar
        placeholder="Enter tube station or postcode"
        onSearch={(value) => console.log('Searching:', value)}
        suggestions={[
          'SW1A 1AA - Westminster',
          'E1 6AN - Tower of London',
          'WC2N 5DU - Covent Garden',
        ]}
      />
      <p className="text-xs text-gray-500">
        Start typing to see suggestions
      </p>
    </div>
  ),
};