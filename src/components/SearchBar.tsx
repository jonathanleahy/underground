import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../types/underground';
import undergroundData from '../data/underground-data.json';
import premierInnData from '../data/premier-inn-hotels.json';
import './SearchBar.css';

interface SearchBarProps {
  onStationSelect: (station: Station) => void;
  onHotelSelect: (hotel: any) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onStationSelect, onHotelSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const matchedStations = undergroundData.stations
      .filter(station => 
        station.name.toLowerCase().includes(searchTerm) ||
        station.lines.some(line => line.toLowerCase().includes(searchTerm))
      )
      .slice(0, 5)
      .map(station => ({
        ...station,
        type: 'station',
        displayName: station.name,
        subtitle: `Station • ${station.lines.join(', ')}`,
        icon: '🚇'
      }));

    const matchedHotels = premierInnData.hotels
      .filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm) ||
        hotel.area.toLowerCase().includes(searchTerm) ||
        hotel.nearestTube.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5)
      .map(hotel => ({
        ...hotel,
        type: 'hotel',
        displayName: hotel.name,
        subtitle: `Hotel • ${hotel.area} • Near ${hotel.nearestTube}`,
        icon: '🏨'
      }));

    setSuggestions([...matchedStations, ...matchedHotels]);
    setShowSuggestions(true);
  }, [query]);

  const handleSelect = (item: any) => {
    if (item.type === 'station') {
      onStationSelect(item);
    } else {
      onHotelSelect(item);
    }
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search stations or hotels..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
        />
        {query && (
          <button className="clear-button" onClick={() => setQuery('')}>
            ✕
          </button>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((item, index) => (
            <div
              key={`${item.type}-${item.id}-${index}`}
              className="suggestion-item"
              onClick={() => handleSelect(item)}
            >
              <span className="suggestion-icon">{item.icon}</span>
              <div className="suggestion-content">
                <div className="suggestion-name">{item.displayName}</div>
                <div className="suggestion-subtitle">{item.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};