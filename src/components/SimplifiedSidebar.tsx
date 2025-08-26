import React, { useState } from 'react';
import { PostcodeCommuterFinder } from './PostcodeCommuterFinder';
import { DatePicker } from './DatePicker';
import './SimplifiedSidebar.css';

interface SimplifiedSidebarProps {
  stations: any[];
  hotels: any[];
  hotelPricing: Map<string, any>;
  selectedDate: any;
  onDateChange: (checkIn: string, nights: number, adults: number, children: number) => void;
  onSearchPrices: () => void;
  onSelectHotel: (hotel: any) => void;
  onShowRoute: (fromStation: string, toStation: string) => void;
  showHotels: boolean;
  setShowHotels: (show: boolean) => void;
  showPricesOnMap: boolean;
  setShowPricesOnMap: (show: boolean) => void;
  lines: any[];
  selectedLines: Set<string>;
  onLineToggle: (lineId: string) => void;
}

export const SimplifiedSidebar: React.FC<SimplifiedSidebarProps> = ({
  stations,
  hotels,
  hotelPricing,
  selectedDate,
  onDateChange,
  onSearchPrices,
  onSelectHotel,
  onShowRoute,
  showHotels,
  setShowHotels,
  showPricesOnMap,
  setShowPricesOnMap,
  lines,
  selectedLines,
  onLineToggle
}) => {
  const [activeTab, setActiveTab] = useState<'hotels' | 'explore'>('hotels');
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="simplified-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h2>🚇 London Hotels & Tube Map</h2>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`}
          onClick={() => setActiveTab('hotels')}
        >
          🏨 Find Hotels
        </button>
        <button
          className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          🗺️ Explore Map
        </button>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {activeTab === 'hotels' ? (
          <div className="hotels-tab">
            {/* Date Selection - Compact */}
            <div className="date-section compact">
              <DatePicker
                onDateChange={onDateChange}
                onSearch={onSearchPrices}
              />
            </div>

            {/* Main Hotel Finder */}
            <PostcodeCommuterFinder
              stations={stations}
              hotels={hotels}
              hotelPricing={hotelPricing}
              selectedDate={selectedDate}
              onSelectHotel={(hotel) => {
                onSelectHotel(hotel);
                setShowHotels(true);
                setShowPricesOnMap(true);
              }}
              onShowRoute={onShowRoute}
            />

            {/* Map Display Options - Minimal */}
            <div className="display-options minimal">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={showPricesOnMap}
                  onChange={(e) => setShowPricesOnMap(e.target.checked)}
                />
                <span>Show prices on map</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="explore-tab">
            {/* Tube Lines Filter */}
            <div className="lines-section">
              <h3>Tube Lines</h3>
              <div className="line-grid">
                {lines.map(line => (
                  <button
                    key={line.id}
                    className={`line-btn ${selectedLines.has(line.id) ? 'active' : ''}`}
                    onClick={() => onLineToggle(line.id)}
                    style={{
                      backgroundColor: selectedLines.has(line.id) ? line.color : 'transparent',
                      borderColor: line.color,
                      color: selectedLines.has(line.id) ? 'white' : line.color
                    }}
                  >
                    {line.name}
                  </button>
                ))}
              </div>
              <button
                className="clear-btn"
                onClick={() => {
                  selectedLines.forEach(id => onLineToggle(id));
                }}
              >
                Clear All
              </button>
            </div>

            {/* Advanced Options - Hidden by Default */}
            <button
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
            </button>

            {showAdvanced && (
              <div className="advanced-options">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={showHotels}
                    onChange={(e) => setShowHotels(e.target.checked)}
                  />
                  <span>Show all hotels</span>
                </label>
                {/* Add other advanced options here if needed */}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <a href="https://github.com/jonathanleahy/underground" target="_blank" rel="noopener noreferrer">
          View on GitHub →
        </a>
      </div>
    </div>
  );
};