import React, { useState } from 'react';
import './FloatingControls.css';

interface FloatingControlsProps {
  onToggleSidebar: () => void;
  sidebarVisible: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  mapType: 'street' | 'dark' | 'satellite';
  onMapTypeChange: (type: 'street' | 'dark' | 'satellite') => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  onToggleSidebar,
  sidebarVisible,
  onZoomIn,
  onZoomOut,
  onResetView,
  mapType,
  onMapTypeChange
}) => {
  const [showMapOptions, setShowMapOptions] = useState(false);
  
  return (
    <div className="floating-controls">
      <button
        className="fab fab-primary"
        onClick={onToggleSidebar}
        title={sidebarVisible ? "Hide Controls" : "Show Controls"}
      >
        {sidebarVisible ? '✕' : '☰'}
      </button>
      
      <div className="zoom-controls">
        <button 
          className="zoom-btn"
          onClick={onZoomIn}
          title="Zoom In"
        >
          +
        </button>
        <button 
          className="zoom-btn"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          −
        </button>
        <button 
          className="zoom-btn reset"
          onClick={onResetView}
          title="Reset View"
        >
          ⟲
        </button>
      </div>
      
      <div className="map-type-controls">
        <button
          className="map-type-toggle"
          onClick={() => setShowMapOptions(!showMapOptions)}
          title="Change Map Type"
        >
          🗺️
        </button>
        
        {showMapOptions && (
          <div className="map-type-options">
            <button
              className={`map-type-option ${mapType === 'street' ? 'active' : ''}`}
              onClick={() => {
                onMapTypeChange('street');
                setShowMapOptions(false);
              }}
            >
              Street
            </button>
            <button
              className={`map-type-option ${mapType === 'dark' ? 'active' : ''}`}
              onClick={() => {
                onMapTypeChange('dark');
                setShowMapOptions(false);
              }}
            >
              Dark
            </button>
            <button
              className={`map-type-option ${mapType === 'satellite' ? 'active' : ''}`}
              onClick={() => {
                onMapTypeChange('satellite');
                setShowMapOptions(false);
              }}
            >
              Satellite
            </button>
          </div>
        )}
      </div>
      
      <div className="floating-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#DC241F' }}></span>
          <span>Central</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#0019A8' }}></span>
          <span>Piccadilly</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#000000' }}></span>
          <span>Northern</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#8B5CF6' }}></span>
          <span>Hotels</span>
        </div>
      </div>
    </div>
  );
};