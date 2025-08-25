import React, { useState } from 'react';
import { UndergroundMap } from './UndergroundMap';
import { UndergroundMapOverlay } from './UndergroundMapOverlay';
import './MapToggle.css';

export const MapToggle: React.FC = () => {
  const [viewMode, setViewMode] = useState<'canvas' | 'overlay'>('overlay');

  return (
    <div className="map-toggle-container">
      <div className="view-toggle">
        <button
          className={viewMode === 'canvas' ? 'active' : ''}
          onClick={() => setViewMode('canvas')}
        >
          Canvas View
        </button>
        <button
          className={viewMode === 'overlay' ? 'active' : ''}
          onClick={() => setViewMode('overlay')}
        >
          Map Overlay
        </button>
      </div>
      
      {viewMode === 'canvas' ? <UndergroundMap /> : <UndergroundMapOverlay />}
    </div>
  );
};