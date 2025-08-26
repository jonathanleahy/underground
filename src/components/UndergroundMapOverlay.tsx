import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap, useMapEvents, Marker } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { Station, Line, UndergroundData } from '../types/underground';
import undergroundData from '../data/underground-data.json';
import premierInnData from '../data/premier-inn-hotels.json';
import trackGeometry from '../data/track-geometry.json';
import { lineConnections } from '../data/line-connections';
import { SearchBar } from './SearchBar';
import { DatePicker } from './DatePicker';
import { PriceLabel } from './PriceLabel';
import { RoutePlanner } from './RoutePlanner';
import { PriceFilter } from './PriceFilter';
import { PostcodeCommuterFinder } from './PostcodeCommuterFinder';
import { Route as JourneyRoute, findRoute } from '../services/routingService';
import { smoothLinePath, getLineCurveParams } from '../utils/bezierCurves';
import { fetchMultipleHotelPricing } from '../services/premier-inn-api';
import { getBookingUrl } from '../data/premier-inn-urls';
import { isNearAnyStation, metersToWalkingMinutes, calculateDistance } from '../utils/distance';
import { calculateHotelPrice } from '../utils/priceCalculator';
import 'leaflet/dist/leaflet.css';
import './UndergroundMapOverlay.css';

const typedData = undergroundData as UndergroundData;

// Create hotel icon
const hotelIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="16" height="14" rx="2" fill="#8B5CF6" stroke="#6D28D9" stroke-width="2"/>
      <rect x="8" y="10" width="3" height="3" fill="white"/>
      <rect x="13" y="10" width="3" height="3" fill="white"/>
      <rect x="8" y="15" width="3" height="3" fill="white"/>
      <rect x="13" y="15" width="3" height="3" fill="white"/>
      <path d="M10 3H14V6H10V3Z" fill="#8B5CF6"/>
      <circle cx="12" cy="4" r="1" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 20],
  popupAnchor: [0, -20]
});

// Component to fit map bounds and track zoom
function MapController({ 
  onZoomChange, 
  focusLocation 
}: { 
  onZoomChange: (zoom: number) => void;
  focusLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  
  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });
  
  useEffect(() => {
    if (focusLocation) {
      map.setView([focusLocation.lat, focusLocation.lng], 15, {
        animate: true,
        duration: 0.5
      });
    } else {
      const bounds: LatLngExpression[] = [
        [typedData.bounds.south, typedData.bounds.west],
        [typedData.bounds.north, typedData.bounds.east]
      ];
      map.fitBounds(bounds);
    }
    onZoomChange(map.getZoom());
  }, [map, onZoomChange, focusLocation]);
  
  return null;
}

export const UndergroundMapOverlay: React.FC = () => {
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [showStations, setShowStations] = useState(true);
  const [showHotels, setShowHotels] = useState(false);
  const [showPricesOnMap, setShowPricesOnMap] = useState(false);
  const [useRealTracks, setUseRealTracks] = useState(true);
  const [mapType, setMapType] = useState<'street' | 'dark' | 'satellite'>('street');
  const [currentZoom, setCurrentZoom] = useState(11);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [highlightedItem, setHighlightedItem] = useState<{ id: string; type: 'station' | 'hotel' } | null>(null);
  const [hotelPricing, setHotelPricing] = useState<Map<string, any>>(new Map());
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ 
    checkIn: string; 
    nights: number;
    adults: number;
    children: number;
  }>({ 
    checkIn: '', 
    nights: 1,
    adults: 1,
    children: 0
  });
  const [currentRoute, setCurrentRoute] = useState<JourneyRoute | null>(null);
  const [showRoutePlanner, setShowRoutePlanner] = useState(true); // Show by default
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [actualPriceRange, setActualPriceRange] = useState<[number, number]>([0, 500]);
  const [showCommuterFinder, setShowCommuterFinder] = useState(true); // Default to showing hotel finder
  const [usedLineSegments, setUsedLineSegments] = useState<Map<string, Set<string>> | null>(null);
  const [visibleHotelIds, setVisibleHotelIds] = useState<Set<string> | null>(null);

  const center: LatLngExpression = [
    (typedData.bounds.north + typedData.bounds.south) / 2,
    (typedData.bounds.east + typedData.bounds.west) / 2
  ];

  const toggleLine = (lineId: string) => {
    setSelectedLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineId)) {
        newSet.delete(lineId);
      } else {
        newSet.add(lineId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedLines(new Set());
  };

  const selectAll = () => {
    setSelectedLines(new Set(typedData.lines.map(l => l.id)));
  };

  // Get tile layer URL based on map type
  const getTileLayerUrl = () => {
    switch (mapType) {
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileAttribution = () => {
    switch (mapType) {
      case 'dark':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
      case 'satellite':
        return 'Tiles &copy; Esri';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  // Filter stations based on selected lines
  const visibleStations = showStations
    ? typedData.stations.filter(station =>
        selectedLines.size === 0 || station.lines.some(line => selectedLines.has(line))
      )
    : [];

  const handleStationSelect = (station: Station) => {
    setFocusLocation({ lat: station.lat, lng: station.lng });
    setHighlightedItem({ id: station.id, type: 'station' });
    setTimeout(() => setHighlightedItem(null), 3000);
  };

  const handleHotelSelect = (hotel: any) => {
    setFocusLocation({ lat: hotel.lat, lng: hotel.lng });
    setHighlightedItem({ id: hotel.id, type: 'hotel' });
    setShowHotels(true);
    setTimeout(() => setHighlightedItem(null), 3000);
  };

  const handleDateChange = (checkIn: string, nights: number, adults: number, children: number) => {
    // Date changed, ready to fetch prices
    setSelectedDate({ checkIn, nights, adults, children });
  };

  const handleRouteFound = (route: JourneyRoute) => {
    setCurrentRoute(route);
    // TODO: Highlight route on map
  };
  
  const handleCommuterShowRoute = (fromStation: string, toStation: string) => {
    console.log('Showing route from:', fromStation, 'to:', toStation);
    const route = findRoute(fromStation, toStation);
    console.log('Route found:', route);
    if (route) {
      setCurrentRoute(route);
      // Also ensure hotels are visible
      setShowHotels(true);
    }
  };
  
  const handleStationHighlightFromRoute = (stationId: string) => {
    const station = typedData.stations.find(s => s.id === stationId);
    if (station) {
      setFocusLocation({ lat: station.lat, lng: station.lng });
      setHighlightedItem({ id: stationId, type: 'station' });
      setTimeout(() => setHighlightedItem(null), 3000);
    }
  };
  
  const handlePriceFilterChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };
  
  const isHotelInPriceRange = (hotelId: string): boolean => {
    const pricing = hotelPricing.get(hotelId);
    if (!pricing || !pricing.available || !pricing.price) {
      return false; // Hide sold out hotels
    }
    return pricing.price >= priceRange[0] && pricing.price <= priceRange[1];
  };
  
  const isHotelNearRoute = (hotel: any): boolean => {
    // If no route is selected, show all hotels
    if (!currentRoute || currentRoute.segments.length === 0) {
      return true;
    }
    
    // Get all station coordinates from the route
    const routeStations: Array<{ lat: number; lng: number }> = [];
    currentRoute.segments.forEach(segment => {
      segment.stationDetails.forEach(station => {
        if (station) {
          routeStations.push({ lat: station.lat, lng: station.lng });
        }
      });
    });
    
    // Check if hotel is within walking distance (800m = ~10 min walk) of any route station
    return isNearAnyStation(hotel.lat, hotel.lng, routeStations, 800);
  };
  
  const getNearestRouteStation = (hotel: any): { distance: number; minutes: number } | null => {
    if (!currentRoute || currentRoute.segments.length === 0) {
      return null;
    }
    
    const routeStations: Array<{ lat: number; lng: number }> = [];
    currentRoute.segments.forEach(segment => {
      segment.stationDetails.forEach(station => {
        if (station) {
          routeStations.push({ lat: station.lat, lng: station.lng });
        }
      });
    });
    
    let minDistance = Infinity;
    routeStations.forEach(station => {
      const distance = calculateDistance(hotel.lat, hotel.lng, station.lat, station.lng);
      if (distance < minDistance) {
        minDistance = distance;
      }
    });
    
    return {
      distance: minDistance,
      minutes: metersToWalkingMinutes(minDistance)
    };
  };
  
  const handleSearchPrices = async () => {
    if (!selectedDate.checkIn) {
      console.error('No check-in date selected');
      return;
    }
    
    setLoadingPrices(true);
    try {
      // Calculate checkout date
      const checkOut = new Date(selectedDate.checkIn);
      checkOut.setDate(checkOut.getDate() + selectedDate.nights);
      const checkOutStr = checkOut.toISOString().split('T')[0];
      
      // Fetch real pricing from our API service with hotel coordinates
      const hotelsWithCoords = premierInnData.hotels.map(h => ({
        id: h.id,
        lat: h.lat,
        lng: h.lng
      }));
      const prices = await fetchMultipleHotelPricing(
        hotelsWithCoords,
        selectedDate.checkIn,
        checkOutStr,
        selectedDate.adults,
        selectedDate.children
      );
      
      setHotelPricing(prices);
      setShowHotels(true); // Auto-show hotels when prices are fetched
      
      // Calculate min and max prices for filter
      let min = Infinity;
      let max = 0;
      prices.forEach(price => {
        if (price.available && price.price) {
          min = Math.min(min, price.price);
          max = Math.max(max, price.price);
        }
      });
      if (min !== Infinity) {
        setActualPriceRange([Math.floor(min), Math.ceil(max)]);
        setPriceRange([Math.floor(min), Math.ceil(max)]);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
    setLoadingPrices(false);
  };

  return (
    <div className="map-overlay-container">
      <SearchBar 
        onStationSelect={handleStationSelect}
        onHotelSelect={handleHotelSelect}
      />
      
      <div className="map-controls">
        {/* Hotel Finder Section - PRIMARY */}
        <div className="control-section">
          <button
            onClick={() => {
              setShowCommuterFinder(!showCommuterFinder);
              // Automatically show hotels when opening commuter finder
              if (!showCommuterFinder) {
                setShowHotels(true);
                setShowPricesOnMap(true);
              }
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: showCommuterFinder 
                ? 'linear-gradient(135deg, #059669, #10B981)' 
                : 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: showCommuterFinder ? '12px' : '0'
            }}
          >
            {showCommuterFinder ? '✕ Close Hotel Finder' : '🏨 Find Hotels Near Your Destination'}
          </button>
          
          {showCommuterFinder && (
            <PostcodeCommuterFinder
              stations={typedData.stations}
              hotels={premierInnData.hotels}
              hotelPricing={hotelPricing}
              selectedDate={selectedDate}
              onSelectHotel={(hotel) => {
                setHighlightedItem({ id: hotel.id, type: 'hotel' });
                setFocusLocation({ lat: hotel.lat, lng: hotel.lng });
                setShowHotels(true);
                setShowPricesOnMap(true);
              }}
              onShowRoute={handleCommuterShowRoute}
              onSearchComplete={(usedSegments, visibleHotelIds) => {
                // Automatically show hotels and prices when search completes
                setShowHotels(true);
                setShowPricesOnMap(true);
                setUsedLineSegments(usedSegments || null);
                setVisibleHotelIds(visibleHotelIds || null);
              }}
            />
          )}
        </div>
        
        {/* Journey Planner Section */}
        <div className="control-section">
          <button
            onClick={() => setShowRoutePlanner(!showRoutePlanner)}
            style={{
              width: '100%',
              padding: '10px',
              background: showRoutePlanner 
                ? 'linear-gradient(135deg, #6B7280, #4B5563)' 
                : 'linear-gradient(135deg, #3B82F6, #1E40AF)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: showRoutePlanner ? '12px' : '0'
            }}
          >
            {showRoutePlanner ? '− Hide Journey Planner' : '+ Show Journey Planner 🚇'}
          </button>
          
          {showRoutePlanner && (
            <RoutePlanner
              onRouteFound={handleRouteFound}
              onStationHighlight={handleStationHighlightFromRoute}
            />
          )}
        </div>
        
        {/* Hotel Pricing Section */}
        <div className="control-section">
          <button
            onClick={() => setShowHotels(!showHotels)}
            style={{
              width: '100%',
              padding: '10px',
              background: showHotels 
                ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' 
                : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: showHotels ? '12px' : '0'
            }}
          >
            {showHotels ? '− Hide Hotel Availability' : '+ Check Hotel Availability 🏨'}
          </button>
          
          {showHotels && (
            <>
              <DatePicker 
                onDateChange={handleDateChange}
                onSearch={handleSearchPrices}
              />
              
              {hotelPricing.size > 0 && (
                <PriceFilter
                  minPrice={actualPriceRange[0]}
                  maxPrice={actualPriceRange[1]}
                  onFilterChange={handlePriceFilterChange}
                  hotelCount={premierInnData.hotels.length}
                  filteredCount={premierInnData.hotels.filter(h => isHotelInPriceRange(h.id)).length}
                />
              )}
            </>
          )}
        </div>
        
        {/* Commuter Hotel Finder Section */}
        <div className="control-section">
          <button
            onClick={() => {
              setShowCommuterFinder(!showCommuterFinder);
              // Automatically show hotels when opening commuter finder
              if (!showCommuterFinder) {
                setShowHotels(true);
                setShowPricesOnMap(true);
              }
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: showCommuterFinder 
                ? 'linear-gradient(135deg, #059669, #10B981)' 
                : 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: showCommuterFinder ? '12px' : '0'
            }}
          >
            {showCommuterFinder ? '✕ Close Hotel Finder' : '🏨 Find Hotels Near Your Destination'}
          </button>
          
          {showCommuterFinder && (
            <PostcodeCommuterFinder
              stations={typedData.stations}
              hotels={premierInnData.hotels}
              hotelPricing={hotelPricing}
              selectedDate={selectedDate}
              onSelectHotel={(hotel) => {
                setHighlightedItem({ id: hotel.id, type: 'hotel' });
                setFocusLocation({ lat: hotel.lat, lng: hotel.lng });
                setShowHotels(true);
                setShowPricesOnMap(true);
              }}
              onShowRoute={handleCommuterShowRoute}
              onSearchComplete={(usedSegments, visibleHotelIds) => {
                // Automatically show hotels and prices when search completes
                setShowHotels(true);
                setShowPricesOnMap(true);
                setUsedLineSegments(usedSegments || null);
                setVisibleHotelIds(visibleHotelIds || null);
              }}
            />
          )}
        </div>
        
        <div className="control-section">
          <h3>London Underground Lines</h3>
          <div className="line-toggles">
            {typedData.lines.map(line => (
              <button
                key={line.id}
                className={`line-toggle ${selectedLines.has(line.id) ? 'active' : ''}`}
                style={{
                  borderColor: line.color,
                  backgroundColor: selectedLines.has(line.id) ? line.color : 'transparent',
                  color: selectedLines.has(line.id) ? '#fff' : line.color
                }}
                onClick={() => toggleLine(line.id)}
              >
                {line.name}
              </button>
            ))}
          </div>
          <div className="control-buttons">
            <button onClick={selectAll}>Select All</button>
            <button onClick={clearSelection}>Clear</button>
          </div>
        </div>

        <div className="control-section">
          <h4>Display Options</h4>
          <label>
            <input
              type="checkbox"
              checked={showStations}
              onChange={(e) => setShowStations(e.target.checked)}
            />
            Show Stations
          </label>
          <label>
            <input
              type="checkbox"
              checked={showHotels}
              onChange={(e) => setShowHotels(e.target.checked)}
            />
            Show Premier Inn Hotels ({premierInnData.hotels.length})
          </label>
          {showHotels && hotelPricing.size > 0 && (
            <label>
              <input
                type="checkbox"
                checked={showPricesOnMap}
                onChange={(e) => setShowPricesOnMap(e.target.checked)}
              />
              Show Prices on Map
            </label>
          )}
          <label>
            <input
              type="checkbox"
              checked={useRealTracks}
              onChange={(e) => setUseRealTracks(e.target.checked)}
            />
            Use Real Track Paths (21,725 GPS points)
          </label>
        </div>

        <div className="control-section">
          <h4>Map Style</h4>
          <div className="map-type-buttons">
            <button
              className={mapType === 'street' ? 'active' : ''}
              onClick={() => setMapType('street')}
            >
              Street
            </button>
            <button
              className={mapType === 'dark' ? 'active' : ''}
              onClick={() => setMapType('dark')}
            >
              Dark
            </button>
            <button
              className={mapType === 'satellite' ? 'active' : ''}
              onClick={() => setMapType('satellite')}
            >
              Satellite
            </button>
          </div>
        </div>

        <div className="control-section stats">
          <p>Stations shown: {visibleStations.length}</p>
          <p>Lines selected: {selectedLines.size}</p>
          {showHotels && <p>Hotels shown: {premierInnData.hotels.length}</p>}
          {hotelPricing.size > 0 && (
            <>
              <p>Available: {Array.from(hotelPricing.values()).filter(p => p.available).length}</p>
              <p>Avg price: £{Math.round(
                Array.from(hotelPricing.values())
                  .filter(p => p.available)
                  .reduce((sum, p) => sum + p.price, 0) / 
                Array.from(hotelPricing.values()).filter(p => p.available).length
              )}</p>
            </>
          )}
          {loadingPrices && <p>⏳ Loading prices...</p>}
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={11}
        className="leaflet-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          url={getTileLayerUrl()}
          attribution={getTileAttribution()}
        />
        <MapController 
          onZoomChange={setCurrentZoom} 
          focusLocation={focusLocation}
        />

        {/* Draw tube lines - either real tracks or station connections */}
        {Array.from(selectedLines).map(lineId => {
          const line = typedData.lines.find(l => l.id === lineId);
          if (!line) return null;

          // Check if we have real track geometry for this line
          const realTracks = trackGeometry.trackGeometry[lineId];
          
          if (useRealTracks && realTracks) {
            // Use real GPS track data
            return realTracks.map((trackPath, pathIndex) => {
              const coordinates: LatLngExpression[] = trackPath.map(coord => 
                [coord[0], coord[1]] as LatLngExpression
              );
              
              if (coordinates.length < 2) return null;
              
              return (
                <Polyline
                  key={`${line.id}-real-${pathIndex}`}
                  positions={coordinates}
                  color={line.color}
                  weight={currentZoom > 12 ? 5 : currentZoom > 10 ? 4 : 3}
                  opacity={0.8}
                  smoothFactor={0}
                />
              );
            });
          } else {
            // Fall back to station-to-station connections with bezier curves
            const connections = lineConnections[lineId] || [];
            const curveParams = getLineCurveParams(lineId);
            
            return connections.map((segment, segmentIndex) => {
              const segmentCoordinates: LatLngExpression[] = segment
                .map(stationId => {
                  const station = typedData.stations.find(s => s.id === stationId);
                  return station ? [station.lat, station.lng] as LatLngExpression : null;
                })
                .filter((coord): coord is LatLngExpression => coord !== null);

              if (segmentCoordinates.length < 2) return null;

              // Apply bezier curves for smooth lines
              const smoothedPath = smoothLinePath(segmentCoordinates, curveParams.tension);

              return (
                <Polyline
                  key={`${line.id}-${segmentIndex}`}
                  positions={smoothedPath}
                  color={line.color}
                  weight={currentZoom > 12 ? 5 : currentZoom > 10 ? 4 : 3}
                  opacity={0.8}
                  smoothFactor={1}
                />
              );
            });
          }
        })}

        {/* Highlight current route if exists */}
        {currentRoute && currentRoute.segments.map((segment, index) => {
          const lineId = segment.line;
          const realTracks = trackGeometry.trackGeometry[lineId];
          
          // If we have real tracks and it's enabled, use them for the route
          if (useRealTracks && realTracks && realTracks.length > 0) {
            // For simplicity, show all real track segments for this line
            // In a more sophisticated version, we'd find the exact track segment between stations
            return realTracks.map((trackPath, pathIndex) => {
              const coordinates: LatLngExpression[] = trackPath.map(coord => 
                [coord[0], coord[1]] as LatLngExpression
              );
              
              return (
                <Polyline
                  key={`route-real-${index}-${pathIndex}`}
                  positions={coordinates}
                  color={segment.color}
                  weight={10}
                  opacity={1}
                  className="route-highlight-real"
                />
              );
            });
          } else {
            // Fall back to station-to-station straight lines with dashes
            const segmentCoords: LatLngExpression[] = segment.stationDetails
              .filter(s => s) // Filter out undefined stations
              .map(station => [station.lat, station.lng] as LatLngExpression);
            
            if (segmentCoords.length < 2) return null;
            
            // Apply bezier curves for smoother lines
            const curveParams = getLineCurveParams(lineId);
            const smoothedPath = smoothLinePath(segmentCoords, curveParams);
            
            return (
              <Polyline
                key={`route-segment-${index}`}
                positions={smoothedPath}
                color={segment.color}
                weight={8}
                opacity={0.9}
                dashArray="5, 10"
                className="route-highlight"
              />
            );
          }
        })}
        
        {/* Draw stations */}
        {visibleStations.map(station => {
          const position: LatLngExpression = [station.lat, station.lng];
          
          // Determine station color based on lines
          let fillColor = '#ffffff';
          let borderColor = '#333333';
          
          // Check if station is part of current route
          const isInRoute = currentRoute && currentRoute.segments.some(segment => 
            segment.stations.includes(station.id)
          );
          
          // If station is in route, highlight it
          if (isInRoute) {
            fillColor = '#FFD700'; // Gold color for route stations
            borderColor = '#FFA500'; // Orange border
          }
          // If lines are selected, color the station by its line
          else if (selectedLines.size > 0) {
            const activeLine = station.lines.find(line => selectedLines.has(line));
            if (activeLine) {
              const lineData = typedData.lines.find(l => l.id === activeLine);
              if (lineData) {
                fillColor = lineData.color;
                borderColor = lineData.color;
              }
            }
          } else if (station.lines.length === 1) {
            // If no lines selected but station has only one line, use that color
            const lineData = typedData.lines.find(l => l.id === station.lines[0]);
            if (lineData) {
              fillColor = lineData.color;
              borderColor = lineData.color;
            }
          }

          const isInterchange = station.lines.length > 1;
          
          // Calculate radius based on zoom level
          const baseRadius = isInterchange ? 8 : 6;
          const radius = currentZoom > 13 ? baseRadius : 
                         currentZoom > 11 ? baseRadius * 0.8 : 
                         currentZoom > 9 ? baseRadius * 0.6 : 
                         baseRadius * 0.4;

          const isHighlighted = highlightedItem?.type === 'station' && highlightedItem.id === station.id;

          return (
            <CircleMarker
              key={station.id}
              center={position}
              radius={isHighlighted ? radius * 1.5 : radius}
              fillColor={isInterchange && selectedLines.size === 0 ? '#ffffff' : fillColor}
              color={isHighlighted ? '#ff6b6b' : borderColor}
              weight={isHighlighted ? 4 : isInterchange ? 2.5 : 2}
              opacity={1}
              fillOpacity={isInterchange && selectedLines.size === 0 ? 1 : 0.9}
            >
              <Popup>
                <div className="station-popup">
                  <h4>{station.name}</h4>
                  <p><strong>Lines:</strong></p>
                  <div className="station-lines">
                    {station.lines.map(lineId => {
                      const line = typedData.lines.find(l => l.id === lineId);
                      return line ? (
                        <span
                          key={lineId}
                          className="line-badge"
                          style={{ backgroundColor: line.color }}
                        >
                          {line.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  {station.zone.length > 0 && (
                    <p><strong>Zone:</strong> {station.zone.join(', ')}</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Draw Premier Inn hotels */}
        {showHotels && premierInnData.hotels
          .filter(hotel => !visibleHotelIds || visibleHotelIds.has(hotel.id))
          .map(hotel => {
          const position: LatLngExpression = [hotel.lat, hotel.lng];
          const isHighlighted = highlightedItem?.type === 'hotel' && highlightedItem.id === hotel.id;
          
          // Get or calculate stable pricing
          let estimatedPrice = 0;
          if (hotelPricing.has(hotel.id)) {
            estimatedPrice = hotelPricing.get(hotel.id).price;
          } else {
            // Use deterministic price calculation
            estimatedPrice = calculateHotelPrice(hotel.id, hotel.lat, hotel.lng, selectedDate.checkIn);
          }
          
          const inPriceRange = hotelPricing.size === 0 || isHotelInPriceRange(hotel.id);
          const nearRoute = isHotelNearRoute(hotel);
          const walkingInfo = getNearestRouteStation(hotel);
          
          // Calculate opacity based on price filter, route proximity, and availability
          let opacity = 0.8;
          if (!inPriceRange) {
            opacity = 0.2; // Very transparent if outside price range or sold out
          } else if (!nearRoute) {
            opacity = 0.1; // Almost invisible if not near route
          } else if (isHighlighted) {
            opacity = 1;
          }
          
          return (
            <React.Fragment key={hotel.id}>
              <Marker
                position={position}
                icon={hotelIcon}
                opacity={opacity}
              >
              <Popup>
                <div className="hotel-popup">
                  <h4>🏨 {hotel.name}</h4>
                  <p><strong>Area:</strong> {hotel.area}</p>
                  <p><strong>Nearest Tube:</strong> {hotel.nearestTube}</p>
                  {hotel.distanceToTube && (
                    <p><strong>Distance:</strong> {hotel.distanceToTube}</p>
                  )}
                  
                  {/* Show walking distance from route if route is selected */}
                  {walkingInfo && walkingInfo.minutes <= 10 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      marginTop: '8px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      🚶 {walkingInfo.minutes} min walk from your route
                    </div>
                  )}
                  
                  {hotelPricing.has(hotel.id) && (
                    <div className={`hotel-price-info ${hotelPricing.get(hotel.id).available ? '' : 'unavailable'}`}>
                      {hotelPricing.get(hotel.id).available ? (
                        <>
                          {hotelPricing.get(hotel.id).originalPrice ? (
                            <div className="hotel-price-details">
                              <div className="original-price">
                                £{hotelPricing.get(hotel.id).originalPrice} / night
                              </div>
                              <div>£{hotelPricing.get(hotel.id).price} / night</div>
                              <div className="discount">
                                Save £{hotelPricing.get(hotel.id).originalPrice - hotelPricing.get(hotel.id).price}!
                              </div>
                            </div>
                          ) : (
                            <div>£{hotelPricing.get(hotel.id).price} / night</div>
                          )}
                          {hotelPricing.get(hotel.id).roomsLeft && hotelPricing.get(hotel.id).roomsLeft <= 3 && (
                            <div className="rooms-left">
                              Only {hotelPricing.get(hotel.id).roomsLeft} rooms left!
                            </div>
                          )}
                        </>
                      ) : (
                        <div>Fully Booked</div>
                      )}
                    </div>
                  )}
                  
                  <a
                    href={(() => {
                      if (selectedDate.checkIn) {
                        const checkOut = new Date(selectedDate.checkIn);
                        checkOut.setDate(checkOut.getDate() + selectedDate.nights);
                        return getBookingUrl(
                          hotel.id, 
                          selectedDate.checkIn, 
                          checkOut.toISOString().split('T')[0],
                          selectedDate.adults,
                          selectedDate.children
                        );
                      }
                      return getBookingUrl(hotel.id);
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hotel-booking-link"
                  >
                    <span>Book on Premier Inn →</span>
                  </a>
                </div>
              </Popup>
            </Marker>
            
            {/* Show price label on map if enabled */}
            {showPricesOnMap && inPriceRange && nearRoute && (
              <PriceLabel
                position={[hotel.lat, hotel.lng]}
                price={estimatedPrice}
                available={hotelPricing.has(hotel.id) ? hotelPricing.get(hotel.id).available : true}
                originalPrice={hotelPricing.has(hotel.id) ? hotelPricing.get(hotel.id).originalPrice : null}
              />
            )}
          </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};