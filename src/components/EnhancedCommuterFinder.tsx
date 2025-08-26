import React, { useState, useEffect, useMemo } from 'react';
import { findRoute, Route } from '../services/routingService';
import { Station } from '../types/underground';
import { calculateDistance, metersToWalkingMinutes } from '../utils/distance';
import { popularVenues } from '../data/conference-venues';
import { getBookingUrl } from '../data/premier-inn-urls';
import './EnhancedCommuterFinder.css';

interface EnhancedCommuterFinderProps {
  stations: Station[];
  hotels: any[];
  hotelPricing: Map<string, any>;
  selectedDate: {
    checkIn: string;
    nights: number;
    adults: number;
    children: number;
  };
  onSelectHotel: (hotel: any) => void;
  onShowRoute: (fromStation: string, toStation: string) => void;
}

interface HotelWithCommute {
  hotel: any;
  nearestStation: Station | null;
  walkingMinutes: number;
  commuteMinutes: number;
  totalMinutes: number;
  route: Route | null;
  price: number;
  totalStayCost: number;
  score: number;
  directRoute: boolean;
}

export const EnhancedCommuterFinder: React.FC<EnhancedCommuterFinderProps> = ({
  stations,
  hotels,
  hotelPricing,
  selectedDate,
  onSelectHotel,
  onShowRoute
}) => {
  const [workplaceStation, setWorkplaceStation] = useState<string>('');
  const [maxCommuteTime, setMaxCommuteTime] = useState<number>(30);
  const [maxBudget, setMaxBudget] = useState<number>(150);
  const [requireDirectRoute, setRequireDirectRoute] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hotelsWithCommute, setHotelsWithCommute] = useState<HotelWithCommute[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');
  
  // Calculate nights for total cost
  const numberOfNights = selectedDate.nights || 1;

  // Quick venue selection
  const handleVenueSelect = (venueStation: string) => {
    setWorkplaceStation(venueStation);
  };

  // Calculate commutes for all hotels
  useEffect(() => {
    const calculateCommutes = async () => {
      if (!workplaceStation) return;
      
      setIsCalculating(true);
      const results: HotelWithCommute[] = [];
      
      for (const hotel of hotels) {
        // Find nearest station to hotel
        let nearestStation: Station | null = null;
        let minDistance = Infinity;
        
        for (const station of stations) {
          const distance = calculateDistance(
            hotel.lat, hotel.lng,
            station.lat, station.lng
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestStation = station;
          }
        }
        
        if (nearestStation && minDistance <= 1000) { // Within 1km walking distance
          const walkingMinutes = metersToWalkingMinutes(minDistance);
          
          // Calculate route from nearest station to workplace
          const route = findRoute(nearestStation.id, workplaceStation);
          
          if (route) {
            const commuteMinutes = route.estimatedTime;
            const totalMinutes = walkingMinutes + commuteMinutes;
            
            // Get price information
            const priceInfo = hotelPricing.get(hotel.id);
            let price = priceInfo?.price;
            
            // If no actual price, estimate based on distance from center
            if (!price) {
              const centerLat = 51.5074;
              const centerLng = -0.1278;
              const distanceFromCenterMeters = calculateDistance(hotel.lat, hotel.lng, centerLat, centerLng);
              const distanceKm = distanceFromCenterMeters / 1000;
              
              if (distanceKm < 3) {
                price = Math.round(120 + Math.random() * 60);
              } else if (distanceKm < 8) {
                price = Math.round(80 + Math.random() * 40);
              } else {
                price = Math.round(50 + Math.random() * 30);
              }
            }
            
            const totalStayCost = price * numberOfNights;
            const directRoute = route.changes === 0;
            
            // Calculate conversion-optimized score
            // Lower score = better (optimized for booking likelihood)
            const timeScore = totalMinutes / 45; // Normalize around 45 min
            const priceScore = price / maxBudget; // Normalize to budget
            const walkScore = walkingMinutes / 10; // Normalize around 10 min walk
            const changesPenalty = route.changes * 0.3; // Penalty for line changes
            
            // Weighted for conversion (emphasize convenience)
            const score = (timeScore * 0.35) + (priceScore * 0.25) + 
                         (walkScore * 0.25) + (changesPenalty * 0.15);
            
            results.push({
              hotel,
              nearestStation,
              walkingMinutes,
              commuteMinutes,
              totalMinutes,
              route,
              price,
              totalStayCost,
              score,
              directRoute
            });
          }
        }
      }
      
      setHotelsWithCommute(results);
      setIsCalculating(false);
    };
    
    calculateCommutes();
  }, [workplaceStation, hotels, hotelPricing, stations, numberOfNights, maxBudget]);

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    let filtered = hotelsWithCommute.filter(h => {
      const meetsTimeReq = h.totalMinutes <= maxCommuteTime;
      const meetsBudgetReq = h.price <= maxBudget;
      const meetsDirectReq = !requireDirectRoute || h.directRoute;
      return meetsTimeReq && meetsBudgetReq && meetsDirectReq;
    });
    
    // Sort by conversion-optimized score
    filtered.sort((a, b) => a.score - b.score);
    
    return filtered;
  }, [hotelsWithCommute, maxCommuteTime, maxBudget, requireDirectRoute]);

  // Get top 3 recommendations
  const topRecommendations = filteredHotels.slice(0, 3);
  
  const handleBookNow = (hotel: any) => {
    // Track selection for analytics (in real app)
    console.log('Booking initiated for:', hotel.name);
    
    // Generate booking URL
    const bookingUrl = selectedDate.checkIn 
      ? getBookingUrl(
          hotel.id,
          selectedDate.checkIn,
          new Date(new Date(selectedDate.checkIn).getTime() + 
            selectedDate.nights * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          selectedDate.adults,
          selectedDate.children
        )
      : getBookingUrl(hotel.id);
    
    // Open in new tab
    window.open(bookingUrl, '_blank');
  };

  const toggleComparison = (hotelId: string) => {
    const newSet = new Set(selectedForComparison);
    if (newSet.has(hotelId)) {
      newSet.delete(hotelId);
    } else if (newSet.size < 3) {
      newSet.add(hotelId);
    }
    setSelectedForComparison(newSet);
  };

  return (
    <div className="enhanced-commuter-finder">
      <div className="finder-header">
        <h3>🏨 Find Your Perfect Conference Hotel</h3>
        <p className="finder-tagline">
          Quick booking • Best prices • Easy commute
        </p>
      </div>

      {/* Quick Venue Selection */}
      <div className="venue-presets">
        <label>Popular Venues & Stations:</label>
        <div className="venue-grid">
          {popularVenues.slice(0, 6).map(venue => (
            <button
              key={venue.id}
              className={`venue-btn ${workplaceStation === venue.station ? 'selected' : ''}`}
              onClick={() => handleVenueSelect(venue.station)}
              title={venue.area}
            >
              <span className="venue-icon">{venue.icon}</span>
              <span className="venue-name">{venue.name}</span>
            </button>
          ))}
        </div>
        
        {/* Custom station selector */}
        <select
          value={workplaceStation}
          onChange={(e) => setWorkplaceStation(e.target.value)}
          className="station-dropdown"
        >
          <option value="">Or choose any station...</option>
          {stations
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
        </select>
      </div>

      {/* Smart Filters */}
      {workplaceStation && (
        <div className="smart-filters">
          <div className="filter-row">
            <div className="filter-item">
              <label>
                Max journey: <strong>{maxCommuteTime} min</strong>
              </label>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={maxCommuteTime}
                onChange={(e) => setMaxCommuteTime(parseInt(e.target.value))}
                className="filter-slider time-slider"
              />
            </div>
            
            <div className="filter-item">
              <label>
                Max per night: <strong>£{maxBudget}</strong>
              </label>
              <input
                type="range"
                min="50"
                max="250"
                step="10"
                value={maxBudget}
                onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                className="filter-slider budget-slider"
              />
            </div>
          </div>
          
          <div className="filter-toggles">
            <label className="toggle-option">
              <input
                type="checkbox"
                checked={requireDirectRoute}
                onChange={(e) => setRequireDirectRoute(e.target.checked)}
              />
              <span>Direct route only (no line changes)</span>
            </label>
          </div>
        </div>
      )}

      {/* Results */}
      {workplaceStation && (
        <>
          {isCalculating ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Finding your perfect hotel...</p>
            </div>
          ) : filteredHotels.length > 0 ? (
            <>
              {/* Top Recommendations - Conversion Focused */}
              <div className="top-recommendations">
                <h4>🎯 Top Recommendations for You</h4>
                <div className="recommendation-cards">
                  {topRecommendations.map((item, index) => {
                    const priceInfo = hotelPricing.get(item.hotel.id);
                    const isAvailable = priceInfo?.available !== false;
                    const isBestValue = index === 0;
                    
                    return (
                      <div 
                        key={item.hotel.id}
                        className={`recommendation-card ${isBestValue ? 'best-value' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                      >
                        {isBestValue && (
                          <div className="best-badge">
                            ⭐ BEST CHOICE
                          </div>
                        )}
                        
                        <div className="card-header">
                          <h5>{item.hotel.name}</h5>
                          <p className="hotel-area">{item.hotel.area}</p>
                        </div>
                        
                        <div className="card-metrics">
                          <div className="metric">
                            <span className="metric-icon">⏱️</span>
                            <div>
                              <strong>{item.totalMinutes} min</strong>
                              <span className="metric-detail">door to door</span>
                            </div>
                          </div>
                          
                          <div className="metric">
                            <span className="metric-icon">🚇</span>
                            <div>
                              <strong>{item.directRoute ? 'Direct' : `${item.route?.changes} change${item.route?.changes > 1 ? 's' : ''}`}</strong>
                              <span className="metric-detail">{item.walkingMinutes} min walk</span>
                            </div>
                          </div>
                          
                          <div className="metric price-metric">
                            <span className="metric-icon">💷</span>
                            <div>
                              <strong>£{item.price}</strong>
                              <span className="metric-detail">per night</span>
                            </div>
                          </div>
                        </div>
                        
                        {numberOfNights > 1 && (
                          <div className="total-stay-cost">
                            <span>Total for {numberOfNights} nights:</span>
                            <strong>£{item.totalStayCost}</strong>
                          </div>
                        )}
                        
                        {priceInfo?.roomsLeft && priceInfo.roomsLeft <= 3 && (
                          <div className="urgency-message">
                            🔥 Only {priceInfo.roomsLeft} rooms left!
                          </div>
                        )}
                        
                        <div className="card-actions">
                          <button
                            className="view-route-btn"
                            onClick={() => {
                              onSelectHotel(item.hotel);
                              if (item.nearestStation) {
                                onShowRoute(item.nearestStation.id, workplaceStation);
                              }
                            }}
                          >
                            View on Map
                          </button>
                          
                          {isAvailable ? (
                            <button
                              className="book-now-btn"
                              onClick={() => handleBookNow(item.hotel)}
                            >
                              Book Now →
                            </button>
                          ) : (
                            <button className="book-now-btn disabled" disabled>
                              Sold Out
                            </button>
                          )}
                        </div>
                        
                        {isBestValue && (
                          <div className="why-best">
                            <span>✓ Perfect balance of price & convenience</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Results */}
              {filteredHotels.length > 3 && (
                <div className="more-options">
                  <h4>More Options ({filteredHotels.length - 3} hotels)</h4>
                  <div className="compact-list">
                    {filteredHotels.slice(3, 10).map(item => {
                      const priceInfo = hotelPricing.get(item.hotel.id);
                      const isAvailable = priceInfo?.available !== false;
                      
                      return (
                        <div key={item.hotel.id} className="compact-hotel">
                          <div className="compact-info">
                            <strong>{item.hotel.name}</strong>
                            <span className="compact-stats">
                              {item.totalMinutes} min • £{item.price}/night
                              {item.directRoute && ' • Direct'}
                            </span>
                          </div>
                          <button
                            className="compact-book-btn"
                            onClick={() => handleBookNow(item.hotel)}
                            disabled={!isAvailable}
                          >
                            {isAvailable ? 'Book' : 'Sold Out'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : workplaceStation ? (
            <div className="no-results">
              <p>😔 No hotels match your criteria</p>
              <p>Try increasing your budget or commute time</p>
            </div>
          ) : null}
        </>
      )}
      
      {/* Trust Signals */}
      <div className="trust-signals">
        <span>✓ Best Price Guarantee</span>
        <span>✓ Free Cancellation</span>
        <span>✓ Instant Confirmation</span>
      </div>
    </div>
  );
};