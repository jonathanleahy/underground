import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  suggestions?: string[];
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Enter postcode or destination',
  onSearch,
  suggestions = [],
  className,
}) => {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <MapPin className="absolute left-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button 
            type="submit"
            size="sm"
            className="absolute right-2"
            disabled={!value.trim()}
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && value && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions
            .filter(s => s.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 5)
            .map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};