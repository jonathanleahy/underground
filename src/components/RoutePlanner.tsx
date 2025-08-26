import React, { useState, useEffect } from 'react';
import { Station } from '../types/underground';
import undergroundData from '../data/underground-data.json';
import { findRoute, Route, RouteSegment } from '../services/routingService';
import './RoutePlanner.css';

interface RoutePlannerProps {
  onRouteFound?: (route: Route) => void;
  onStationHighlight?: (stationId: string) => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({ 
  onRouteFound, 
  onStationHighlight 
}) => {
  const [fromStation, setFromStation] = useState<string>('');
  const [toStation, setToStation] = useState<string>('');
  const [route, setRoute] = useState<Route | null>(null);
  const [error, setError] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Sort stations alphabetically for dropdowns
  const sortedStations = [...undergroundData.stations].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  const handleFindRoute = () => {
    if (!fromStation || !toStation) {
      setError('Please select both start and end stations');
      return;
    }
    
    if (fromStation === toStation) {
      setError('Start and end stations must be different');
      return;
    }
    
    setError('');
    setIsCalculating(true);
    
    // Small delay for UI feedback
    setTimeout(() => {
      const foundRoute = findRoute(fromStation, toStation);
      
      if (foundRoute) {
        setRoute(foundRoute);
        setShowSummary(true);
        if (onRouteFound) {
          onRouteFound(foundRoute);
        }
      } else {
        setError('No route found between these stations');
      }
      
      setIsCalculating(false);
    }, 100);
  };
  
  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };
  
  const handleClearRoute = () => {
    setRoute(null);
    setShowSummary(false);
    setFromStation('');
    setToStation('');
    setError('');
  };
  
  const formatStationName = (stationId: string): string => {
    const station = undergroundData.stations.find(s => s.id === stationId);
    return station ? station.name : stationId;
  };
  
  const handleStationClick = (stationId: string) => {
    if (onStationHighlight) {
      onStationHighlight(stationId);
    }
  };
  
  return (
    <div className="route-planner">
      <div className="route-planner-header">
        <h3>🚇 Journey Planner</h3>
        {route && (
          <button 
            className="clear-route-btn"
            onClick={handleClearRoute}
            title="Clear route"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="route-planner-controls">
        <div className="station-selectors">
          <div className="station-selector">
            <label htmlFor="from-station">From:</label>
            <select
              id="from-station"
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              disabled={isCalculating}
            >
              <option value="">Select station...</option>
              {sortedStations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="swap-stations-btn"
            onClick={handleSwapStations}
            disabled={!fromStation || !toStation || isCalculating}
            title="Swap stations"
          >
            ⇄
          </button>
          
          <div className="station-selector">
            <label htmlFor="to-station">To:</label>
            <select
              id="to-station"
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              disabled={isCalculating}
            >
              <option value="">Select station...</option>
              {sortedStations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          className="find-route-btn"
          onClick={handleFindRoute}
          disabled={!fromStation || !toStation || isCalculating}
        >
          {isCalculating ? '⏳ Calculating...' : '🔍 Find Route'}
        </button>
        
        {error && (
          <div className="route-error">
            ⚠️ {error}
          </div>
        )}
      </div>
      
      {route && showSummary && (
        <div className="route-summary">
          <div className="route-stats">
            <div className="route-stat">
              <span className="stat-label">Journey time:</span>
              <span className="stat-value">{route.estimatedTime} mins</span>
            </div>
            <div className="route-stat">
              <span className="stat-label">Stations:</span>
              <span className="stat-value">{route.totalStations}</span>
            </div>
            <div className="route-stat">
              <span className="stat-label">Changes:</span>
              <span className="stat-value">{route.changes}</span>
            </div>
          </div>
          
          <div className="route-segments">
            {route.segments.map((segment, index) => (
              <div key={index} className="route-segment">
                <div className="segment-header">
                  <div 
                    className="line-indicator"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="line-name">
                    {segment.line.charAt(0).toUpperCase() + segment.line.slice(1).replace(/-/g, ' ')} Line
                  </span>
                  <span className="station-count">
                    ({segment.stations.length} stations)
                  </span>
                </div>
                
                <div className="segment-stations">
                  {segment.stations.map((stationId, stationIndex) => (
                    <div key={stationIndex} className="segment-station">
                      {stationIndex === 0 && index === 0 && (
                        <span className="station-marker start">⭕</span>
                      )}
                      {stationIndex === 0 && index > 0 && (
                        <span className="station-marker change">🔄</span>
                      )}
                      {stationIndex === segment.stations.length - 1 && 
                       index === route.segments.length - 1 && (
                        <span className="station-marker end">📍</span>
                      )}
                      {!(stationIndex === 0 || 
                         (stationIndex === segment.stations.length - 1 && 
                          index === route.segments.length - 1)) && (
                        <span className="station-marker">•</span>
                      )}
                      <button
                        className="station-link"
                        onClick={() => handleStationClick(stationId)}
                      >
                        {formatStationName(stationId)}
                      </button>
                    </div>
                  ))}
                </div>
                
                {index < route.segments.length - 1 && (
                  <div className="change-instruction">
                    🔄 Change to {route.segments[index + 1].line.charAt(0).toUpperCase() + 
                                   route.segments[index + 1].line.slice(1).replace(/-/g, ' ')} Line
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="route-footer">
            <button
              className="show-on-map-btn"
              onClick={() => onRouteFound && onRouteFound(route)}
            >
              📍 Show on Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};