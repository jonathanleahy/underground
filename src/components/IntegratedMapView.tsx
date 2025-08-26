import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap, Marker } from 'react-leaflet';
import { LatLngExpression, Icon, Map as LeafletMap } from 'leaflet';
import { Station, Line, UndergroundData } from '../types/underground';
import undergroundData from '../data/underground-data.json';
import premierInnData from '../data/premier-inn-hotels.json';
import trackGeometry from '../data/track-geometry.json';
import { PostcodeCommuterFinder } from './PostcodeCommuterFinder';
import { PriceLabel } from './PriceLabel';
import { HotelDetailsPanel } from './HotelDetailsPanel';
import { Route as JourneyRoute, findRoute } from '../services/routingService';
import { calculateHotelPrice } from '../utils/priceCalculator';
import { getBookingUrl } from '../data/premier-inn-urls';
import 'leaflet/dist/leaflet.css';
import './IntegratedMapView.css';

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

// Create best match hotel icon (gold)
const bestMatchIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="20" height="16" rx="2" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
      <rect x="9" y="12" width="3" height="3" fill="white"/>
      <rect x="16" y="12" width="3" height="3" fill="white"/>
      <rect x="9" y="17" width="3" height="3" fill="white"/>
      <rect x="16" y="17" width="3" height="3" fill="white"/>
      <path d="M11 3H17V8H11V3Z" fill="#F59E0B"/>
      <circle cx="14" cy="5" r="1.5" fill="white"/>
      <path d="M14 1L15.5 3.5L18 4L16 6L16.5 8.5L14 7L11.5 8.5L12 6L10 4L12.5 3.5L14 1Z" fill="#FCD34D"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 24],
  popupAnchor: [0, -24]
});

// Map click handler component
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e: any) => {
      // Only trigger if clicking on the map itself (not markers or popups)
      const target = e.originalEvent.target;
      const isMapBackground = 
        target.classList.contains('leaflet-tile') ||
        target.classList.contains('leaflet-container') ||
        target.classList.contains('leaflet-pane') ||
        target.classList.contains('leaflet-overlay-pane') ||
        target.classList.contains('leaflet-zoom-animated');
        
      if (isMapBackground) {
        onMapClick();
      }
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  
  return null;
}

// Map controller component
function MapController({ 
  bounds,
  focusLocation,
  currentRoute,
  detailsPanelOpen
}: { 
  bounds?: { lat: number; lng: number }[] | null;
  focusLocation?: { lat: number; lng: number } | null;
  currentRoute?: JourneyRoute | null;
  detailsPanelOpen?: boolean;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      // Calculate bounds from points
      const lats = bounds.map(b => b.lat);
      const lngs = bounds.map(b => b.lng);
      const southWest: LatLngExpression = [Math.min(...lats), Math.min(...lngs)];
      const northEast: LatLngExpression = [Math.max(...lats), Math.max(...lngs)];
      
      // Adjust padding based on whether details panel is open
      const bottomPadding = detailsPanelOpen ? 250 : 50; // Account for bottom panel height
      map.fitBounds([southWest, northEast], {
        paddingTopLeft: [50, 50],
        paddingBottomRight: [50, bottomPadding],
        maxZoom: 16,
        animate: true,
        duration: 0.5
      });
    } else if (focusLocation) {
      map.setView([focusLocation.lat, focusLocation.lng], 15, {
        animate: true,
        duration: 0.5
      });
    }
  }, [map, bounds, focusLocation, detailsPanelOpen]);
  
  // Remove automatic zoom on route change - let handleShowRoute control zooming
  
  return null;
}

// Helper function to get line color
function getLineColor(lineId: string): string {
  const lineColors: { [key: string]: string } = {
    'bakerloo': '#B36305',
    'central': '#E32017',
    'circle': '#FFD300',
    'district': '#00782A',
    'hammersmith-city': '#F3A9BB',
    'jubilee': '#A0A5A9',
    'metropolitan': '#9B0056',
    'northern': '#000000',
    'piccadilly': '#003688',
    'victoria': '#0098D4',
    'waterloo-city': '#95CDBA',
    'dlr': '#00A4A7',
    'elizabeth': '#7156A5',
    'overground': '#EE7C0E',
    'tram': '#84B817'
  };
  
  // Try both lowercase and as-is
  return lineColors[lineId.toLowerCase()] || lineColors[lineId] || '#667eea';
}

export const IntegratedMapView: React.FC = () => {
  const [visibleHotelIds, setVisibleHotelIds] = useState<Set<string> | null>(null);
  const [highlightedHotel, setHighlightedHotel] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<JourneyRoute | null>(null);
  const [mapBounds, setMapBounds] = useState<{ lat: number; lng: number }[] | null>(null);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showPrices, setShowPrices] = useState(true);
  const [selectedDate] = useState({
    checkIn: '',
    nights: 1,
    adults: 1,
    children: 0
  });
  const [workplaceLocation, setWorkplaceLocation] = useState<{ lat: number; lng: number; postcode: string } | null>(null);
  const [selectedHotelDetails, setSelectedHotelDetails] = useState<any>(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [mapClickedHotelId, setMapClickedHotelId] = useState<string | null>(null);
  const [allSearchResults, setAllSearchResults] = useState<any>(null);
  const [previousBounds, setPreviousBounds] = useState<{ lat: number; lng: number }[] | null>(null);
  const [hasZoomed, setHasZoomed] = useState(false);
  
  // Track workplace location changes
  useEffect(() => {
    // Location updates handled by MapController
  }, [workplaceLocation]);
  const mapRef = useRef<LeafletMap | null>(null);
  
  const center: LatLngExpression = [
    (typedData.bounds.north + typedData.bounds.south) / 2,
    (typedData.bounds.east + typedData.bounds.west) / 2
  ];
  
  const handleHotelSelect = (hotel: any, hotelDetails?: any) => {
    console.log('Hotel selected:', hotel.name);
    setHighlightedHotel(hotel.id);
    
    // If hotel details provided, show the bottom panel
    if (hotelDetails) {
      setSelectedHotelDetails(hotelDetails);
      setDetailsPanelOpen(true);
    }
  };

  const handleMapHotelClick = (hotel: any) => {
    // Check if this is the same hotel clicked twice
    if (mapClickedHotelId === hotel.id) {
      // Second click on same hotel - show hotel details
      const hotelData = allSearchResults?.hotels?.find((h: any) => h.hotel.id === hotel.id);
      if (hotelData) {
        setSelectedHotelDetails(hotelData);
        setDetailsPanelOpen(true);
      }
      // Don't reset mapClickedHotelId here, keep it for consistency
    } else {
      // First click on this hotel (or clicking a different hotel) - show route
      setMapClickedHotelId(hotel.id); // Update to track this hotel
      setHighlightedHotel(hotel.id);
      
      // Find the hotel data to get station info for route
      const hotelData = allSearchResults?.hotels?.find((h: any) => h.hotel.id === hotel.id);
      
      if (hotelData && hotelData.hotelStation && hotelData.workplaceStation) {
        handleShowRoute(
          hotelData.hotelStation.id,
          hotelData.workplaceStation.id,
          { lat: hotel.lat, lng: hotel.lng },
          true // Skip zoom when clicking on map hotel
        );
      }
    }
  };
  
  const handleShowRoute = (fromStation: string, toStation: string, hotelLocation?: { lat: number; lng: number }, skipZoom: boolean = false) => {
    const route = findRoute(fromStation, toStation);
    if (route) {
      setCurrentRoute(route);
      
      // Only zoom if not skipped (e.g., when clicking from left panel)
      if (!skipZoom && route.segments.length > 0 && workplaceLocation) {
        // Save current bounds before zooming
        if (mapBounds && !hasZoomed) {
          setPreviousBounds(mapBounds);
        }
        
        const routeBounds: { lat: number; lng: number }[] = [];
        
        // Add workplace location
        routeBounds.push({ lat: workplaceLocation.lat, lng: workplaceLocation.lng });
        
        // Add hotel location if provided
        if (hotelLocation) {
          routeBounds.push(hotelLocation);
        }
        
        // Add all stations in the route for better framing
        route.segments.forEach(segment => {
          segment.stationDetails?.forEach(station => {
            if (station) {
              routeBounds.push({ lat: station.lat, lng: station.lng });
            }
          });
        });
        
        // Set bounds to zoom the map
        setMapBounds(routeBounds);
        setHasZoomed(true);
      }
    }
  };
  
  const handleBackToOverview = () => {
    if (previousBounds) {
      setMapBounds(previousBounds);
      setHasZoomed(false);
      setPreviousBounds(null);
      setCurrentRoute(null); // Clear the route when going back
      setHighlightedHotel(null); // Clear highlighted hotel
      setMapClickedHotelId(null); // Reset clicked hotel
      setDetailsPanelOpen(false); // Close details panel
    }
  };
  
  const handleMapClick = () => {
    // Clear selection and route when clicking on map background
    if (highlightedHotel || currentRoute) {
      setHighlightedHotel(null);
      setCurrentRoute(null);
      setMapClickedHotelId(null);
      setDetailsPanelOpen(false);
    }
  };
  
  const handleSearchComplete = (
    usedSegments?: Map<string, Set<string>>, 
    hotelIds?: Set<string>,
    bounds?: { lat: number; lng: number }[],
    workLocation?: { lat: number; lng: number; postcode: string },
    searchResults?: any
  ) => {
    // Process search results
    setVisibleHotelIds(hotelIds || null);
    
    // Store search results for popup data - this is critical for route display
    if (searchResults && searchResults.hotels) {
      setAllSearchResults(searchResults);
    }
    
    // Set workplace location ONLY if provided and valid
    if (workLocation && workLocation.lat && workLocation.lng && workLocation.postcode) {
      // Validate coordinates are reasonable for London area
      const isValidLondonCoords = workLocation.lat > 51.2 && workLocation.lat < 51.8 &&
                                   workLocation.lng > -0.6 && workLocation.lng < 0.3;
      
      if (isValidLondonCoords) {
        console.log('Setting workplace location:', workLocation);
        setWorkplaceLocation(workLocation);
      } else {
        console.warn('Invalid coordinates for London area:', workLocation);
      }
    }
    
    // Calculate bounds from visible hotels and workplace
    if (searchResults && searchResults.hotels && searchResults.hotels.length > 0) {
      // Use actual search results to get hotel bounds (more accurate)
      const hotelBounds = searchResults.hotels.map((result: any) => ({ 
        lat: result.hotel.lat, 
        lng: result.hotel.lng 
      }));
      
      // Include workplace in bounds if available
      if (workLocation) {
        hotelBounds.push({ lat: workLocation.lat, lng: workLocation.lng });
      }
      
      setMapBounds(hotelBounds);
      console.log('Setting map bounds to fit', searchResults.hotels.length, 'hotels from search results and workplace');
    } else if (hotelIds && hotelIds.size > 0) {
      // Fallback to hotelIds if searchResults not available
      const visibleHotels = premierInnData.hotels.filter(h => hotelIds.has(h.id));
      if (visibleHotels.length > 0) {
        const hotelBounds = visibleHotels.map(h => ({ lat: h.lat, lng: h.lng }));
        // Include workplace in bounds if available
        if (workLocation) {
          hotelBounds.push({ lat: workLocation.lat, lng: workLocation.lng });
        }
        setMapBounds(hotelBounds);
        console.log('Setting map bounds to fit', visibleHotels.length, 'hotels and workplace');
      }
    } else if (bounds) {
      setMapBounds(bounds);
      console.log('Using provided bounds');
    }
  };
  
  // Get tile layer URL based on style
  const getTileUrl = () => {
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };
  
  return (
    <div className={`integrated-map-view ${detailsPanelOpen ? 'details-open' : ''}`}>
      {/* Left Panel */}
      <div className="left-panel">
        <div className="panel-header">
          <h1>🚇 London Hotel Finder</h1>
          <p>Find the perfect hotel near your destination</p>
        </div>
        
        <div className="panel-content">
          <PostcodeCommuterFinder
            stations={typedData.stations}
            hotels={premierInnData.hotels}
            hotelPricing={new Map()} // Will use calculated prices
            selectedDate={selectedDate}
            onSelectHotel={handleHotelSelect}
            onShowRoute={handleShowRoute}
            onSearchComplete={handleSearchComplete}
            highlightedHotelId={highlightedHotel}
          />
        </div>
        
        <div className="panel-footer">
          <label className="show-prices-toggle">
            <input
              type="checkbox"
              checked={showPrices}
              onChange={(e) => setShowPrices(e.target.checked)}
            />
            Show prices on map
          </label>
        </div>
      </div>
      
      {/* Map Area */}
      <div className="map-area">
        {/* Back to Overview Button */}
        {hasZoomed && previousBounds && (
          <button 
            className="back-to-overview-btn"
            onClick={handleBackToOverview}
          >
            ← Back to overview
          </button>
        )}
        
        {/* Price Legend */}
        <div className="price-legend" style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          zIndex: 1000,
          background: 'white',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Price Range:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px' }}></div>
              <span>Budget</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
              <span>Mid-range</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#a855f7', borderRadius: '2px' }}></div>
              <span>Premium</span>
            </div>
          </div>
        </div>
        
        {/* Reset Zoom Button - always visible */}
        <button 
          className="reset-zoom-btn"
          onClick={() => {
            // Calculate bounds from currently visible hotels and workplace
            const bounds: { lat: number; lng: number }[] = [];
            
            // Add workplace location if available
            if (workplaceLocation) {
              bounds.push(workplaceLocation);
            }
            
            // Add all currently visible hotels
            if (visibleHotelIds) {
              premierInnData.hotels
                .filter(hotel => visibleHotelIds.has(hotel.id))
                .forEach(hotel => {
                  bounds.push({ lat: hotel.lat, lng: hotel.lng });
                });
            }
            
            // If we have bounds, use them; otherwise fall back to default
            if (bounds.length > 0) {
              setMapBounds(bounds);
            } else {
              // Fallback to default London view
              const defaultBounds = [
                { lat: 51.5074, lng: -0.1278 }, // Central London
                { lat: 51.6, lng: -0.3 }, // Northwest
                { lat: 51.4, lng: 0.1 }, // Southeast
              ];
              setMapBounds(defaultBounds);
            }
            
            setHasZoomed(false);
            setPreviousBounds(null);
          }}
          title="Reset zoom to London overview"
        >
          🔄 Reset View
        </button>
        
        <MapContainer
          center={center}
          zoom={11}
          className="full-map"
          ref={mapRef}
        >
          <TileLayer
            url={getTileUrl()}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          <MapController 
            bounds={mapBounds}
            focusLocation={focusLocation}
            currentRoute={currentRoute}
            detailsPanelOpen={detailsPanelOpen}
          />
          
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* Draw tube lines - only connect consecutive stations on the route */}
          {currentRoute && currentRoute.segments.map((segment, index) => {
                if (!segment.stationDetails || segment.stationDetails.length < 2) {
                  return null;
                }
                
                const lineId = segment.line;
                const lineColor = getLineColor(lineId);
                
                // Draw direct lines between consecutive stations in the route
                const pathPoints: LatLngExpression[] = segment.stationDetails
                  .filter(s => s && typeof s.lat === 'number' && typeof s.lng === 'number' && !isNaN(s.lat) && !isNaN(s.lng))
                  .map(station => [station.lat, station.lng] as LatLngExpression);
                
                if (pathPoints.length < 2) {
                  return null;
                }
                
                return (
                  <Polyline
                    key={`route-segment-${index}`}
                    positions={pathPoints}
                    color={lineColor}
                    weight={6}
                    opacity={0.8}
                  />
                );
          })}
          
          {/* Draw stations on route */}
          {currentRoute && currentRoute.segments.map((segment) => 
            segment.stationDetails?.map(station => {
              if (!station) return null;
              const position: LatLngExpression = [station.lat, station.lng];
              
              return (
                <CircleMarker
                  key={station.id}
                  center={position}
                  radius={6}
                  fillColor="#FFD700"
                  color="#FFA500"
                  weight={2}
                  opacity={1}
                  fillOpacity={1}
                >
                  <Popup>
                    <div className="station-popup">
                      <h4>{station.name}</h4>
                      <p>On your route</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })
          )}
          
          {/* Draw hotels */}
          {premierInnData.hotels
            .filter(hotel => {
              const isVisible = !visibleHotelIds || visibleHotelIds.has(hotel.id);
              if (visibleHotelIds && !isVisible) {
                console.log(`Hotel ${hotel.name} (${hotel.id}) filtered out - not in visibleHotelIds`);
              } else if (visibleHotelIds && isVisible) {
                const hotelData = allSearchResults?.hotels?.find((h: any) => h.hotel.id === hotel.id);
                if (hotelData) {
                  console.log(`Showing hotel ${hotel.name} (${hotel.id}) with price £${hotelData.price}`);
                }
              }
              return isVisible;
            })
            .map((hotel, index) => {
              const position: LatLngExpression = [hotel.lat, hotel.lng];
              const isHighlighted = highlightedHotel === hotel.id;
              const price = calculateHotelPrice(hotel.id, hotel.lat, hotel.lng, selectedDate.checkIn);
              // TODO: Track best match hotel ID from search results
              const isBestMatch = false; // Will be implemented when we pass this from PostcodeCommuterFinder
              
              return (
                <React.Fragment key={hotel.id}>
                  {/* Highlight ring for selected hotel */}
                  {isHighlighted && (
                    <CircleMarker
                      center={position}
                      radius={25}
                      fillColor="#fbbf24"
                      color="#f59e0b"
                      weight={3}
                      opacity={0.8}
                      fillOpacity={0.3}
                    />
                  )}
                  
                  <Marker
                    position={position}
                    icon={(() => {
                      const hotelData = allSearchResults?.hotels?.find((h: any) => h.hotel.id === hotel.id);
                      const journeyTime = hotelData?.totalTime;
                      // Add transparency when another hotel is highlighted
                      const isTransparent = highlightedHotel && highlightedHotel !== hotel.id;
                      
                      // Calculate price category based on all visible hotels
                      let priceCategory = 'mid';
                      if (visibleHotelIds && allSearchResults?.hotels) {
                        const visiblePrices = allSearchResults.hotels
                          .filter((h: any) => visibleHotelIds.has(h.hotel.id))
                          .map((h: any) => h.price)
                          .sort((a: number, b: number) => a - b);
                        
                        if (visiblePrices.length > 0) {
                          const minPrice = visiblePrices[0];
                          const maxPrice = visiblePrices[visiblePrices.length - 1];
                          const range = maxPrice - minPrice;
                          const lowThreshold = minPrice + range * 0.33;
                          const highThreshold = minPrice + range * 0.66;
                          
                          if (price <= lowThreshold) {
                            priceCategory = 'low';
                          } else if (price >= highThreshold) {
                            priceCategory = 'high';
                          }
                        }
                      }
                      
                      return L.divIcon({
                        html: `
                          <div class="hotel-map-badge price-${priceCategory} ${isHighlighted ? 'highlighted' : ''} ${isTransparent ? 'transparent' : ''}" 
                               style="${isHighlighted ? 'z-index: 1000 !important;' : ''}">
                            <span class="badge-price">£${price}</span>
                            ${journeyTime ? `<span class="badge-time">${journeyTime}m</span>` : ''}
                          </div>
                        `,
                        className: 'hotel-badge-marker',
                        iconSize: [0, 0],
                        iconAnchor: [0, 0]
                      });
                    })()}
                    eventHandlers={{
                      click: (e) => {
                        e.originalEvent.stopPropagation();
                        handleMapHotelClick(hotel);
                        
                        // Create custom popup with dynamic positioning
                        const hotelData = allSearchResults?.hotels?.find((h: any) => h.hotel.id === hotel.id);
                        
                        // Always show popup, even without route data
                        if (true) {
                          const popupContent = `
                            <div class="hotel-popup">
                              <h4>🏨 ${hotel.name}</h4>
                              <p><strong>Area:</strong> ${hotel.area}</p>
                              ${hotelData ? `
                                <div class="journey-info">
                                  <p class="journey-time">🕐 <strong>${hotelData.totalTime} min journey</strong></p>
                                  <p class="station-info">🚇 From: ${hotelData.hotelStation?.name}</p>
                                  <p class="station-info">📍 To: ${hotelData.workplaceStation?.name}</p>
                                  ${hotelData.changes > 0 ? `<p class="changes">🔄 ${hotelData.changes} ${hotelData.changes === 1 ? 'change' : 'changes'}</p>` : ''}
                                  <p class="walk-time">🚶 ${hotelData.hotelWalkTime + hotelData.workplaceWalkTime} min total walking</p>
                                </div>
                              ` : `
                                <div class="journey-info">
                                  <p style="color: #6b7280; font-style: italic;">Search for a destination to see journey details</p>
                                </div>
                              `}
                              <div class="price-section">
                                <p class="price-main">💷 <strong>£${price}</strong> per night</p>
                                <p class="total-price">Total: £${price * selectedDate.nights} for ${selectedDate.nights} ${selectedDate.nights === 1 ? 'night' : 'nights'}</p>
                              </div>
                              <div class="popup-actions">
                                ${hotelData ? `
                                  <button class="popup-btn route-btn" onclick="console.log('route')">
                                    ${mapClickedHotelId === hotel.id ? 'Show Details' : 'Show Route'}
                                  </button>
                                ` : ''}
                                <a href="${getBookingUrl(hotel.id)}" target="_blank" rel="noopener noreferrer" class="popup-btn booking-btn">
                                  Book Now →
                                </a>
                              </div>
                            </div>
                          `;
                          
                          // Calculate offset based on hotel position relative to workplace
                          // Popup dimensions: ~300px wide, ~350-400px tall
                          const POPUP_WIDTH = 300;
                          const POPUP_HEIGHT = hotelData ? 380 : 250; // Smaller without journey details
                          
                          let offset = L.point(0, -20);
                          let lngDiff = 0;
                          let latDiff = 0;
                          
                          if (workplaceLocation) {
                            lngDiff = hotel.lng - workplaceLocation.lng;
                            latDiff = hotel.lat - workplaceLocation.lat;
                            
                            // Calculate position offset based on relative position to workplace
                            
                            // Determine dominant direction - adjusted threshold for London's latitude
                            if (Math.abs(lngDiff) > Math.abs(latDiff) * 0.7) {
                              // Primarily horizontal difference
                              if (lngDiff < 0) {
                                // Position popup to left
                                offset = L.point(-(POPUP_WIDTH/2 + 20), 0); // Popup to left of marker
                              } else {
                                // Position popup to right
                                offset = L.point(POPUP_WIDTH/2 + 20, 0); // Popup to right of marker
                              }
                            } else {
                              // Primarily vertical difference
                              if (latDiff > 0) {
                                // Position popup above
                                // For top position, we need negative offset (half the popup height + padding)
                                offset = L.point(0, -(POPUP_HEIGHT/2 + 20)); // Popup above marker
                              } else {
                                // Position popup below
                                // For bottom position, we need positive offset (half the popup height + padding)
                                offset = L.point(0, POPUP_HEIGHT/2 + 20); // Popup below marker
                              }
                            }
                          } else {
                            // Default positioning when no workplace - just above
                            offset = L.point(0, -40);
                          }
                          
                          // Create and open popup with custom offset
                          const popup = L.popup({ offset: offset })
                            .setLatLng([hotel.lat, hotel.lng])
                            .setContent(popupContent)
                            .openOn(e.target._map);
                          
                          // Get actual popup dimensions after it's rendered
                          setTimeout(() => {
                            const popupElement = popup.getElement();
                            if (popupElement) {
                              const rect = popupElement.getBoundingClientRect();
                              const actualWidth = rect.width;
                              const actualHeight = rect.height;
                              // Update positioning based on actual dimensions
                              
                              // Recalculate and update offset based on actual dimensions
                              let newOffset = L.point(0, -20);
                              if (Math.abs(lngDiff) > Math.abs(latDiff) * 0.7) {
                                if (lngDiff < 0) {
                                  newOffset = L.point(-(actualWidth/2 + 30), 0);
                                } else {
                                  newOffset = L.point(actualWidth/2 + 30, 0);
                                }
                              } else {
                                if (latDiff > 0) {
                                  newOffset = L.point(0, -(actualHeight/2 + 30));
                                } else {
                                  newOffset = L.point(0, actualHeight/2 + 30);
                                }
                              }
                              
                              // Update popup with correct offset
                              popup.options.offset = newOffset;
                              popup.update();
                            }
                          }, 10);
                        }
                      }
                    }}
                  />
                </React.Fragment>
              );
            })}
            
          {/* Draw workplace marker last so it appears on top */}
          {workplaceLocation && workplaceLocation.lat && workplaceLocation.lng && (
            <>
              {/* Outer ring for visibility */}
              <CircleMarker
                center={[workplaceLocation.lat, workplaceLocation.lng]}
                radius={20}
                fillColor="#dc2626"
                color="#991b1b"
                weight={2}
                opacity={0.4}
                fillOpacity={0.2}
                pane="markerPane"
              />
              {/* Main workplace marker */}
              <CircleMarker
                center={[workplaceLocation.lat, workplaceLocation.lng]}
                radius={10}
                fillColor="#ef4444"
                color="#ffffff"
                weight={3}
                opacity={1}
                fillOpacity={1}
                pane="tooltipPane"  // This pane is above markerPane
              >
                <Popup>
                  <div className="workplace-popup">
                    <h4>🏢 Your Workplace</h4>
                    <p>Postcode: {workplaceLocation.postcode || 'N/A'}</p>
                    <p className="coords">Lat: {workplaceLocation.lat.toFixed(4)}, Lng: {workplaceLocation.lng.toFixed(4)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            </>
          )}
        </MapContainer>
        
        {/* Hotel Details Panel - Bottom */}
        <HotelDetailsPanel
          hotel={selectedHotelDetails}
          isOpen={detailsPanelOpen}
          onClose={() => setDetailsPanelOpen(false)}
          onBook={() => console.log('Booking initiated')}
          checkInDate={selectedDate.checkIn || ''}
          nights={selectedDate.nights}
        />
      </div>
    </div>
  );
};