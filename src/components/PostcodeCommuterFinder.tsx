import React, { useState, useEffect } from 'react';
import { Station } from '../types/underground';
import { findRoute } from '../services/routingService';
import { calculateDistance, metersToWalkingMinutes } from '../utils/distance';
import { calculateHotelPrice } from '../utils/priceCalculator';
import { lookupPostcode, findNearestStations, popularPostcodes, isValidUKPostcode, formatPostcode } from '../services/postcodeService';
import { getBookingUrl } from '../data/premier-inn-urls';
import './PostcodeCommuterFinder.css';

interface PostcodeCommuterFinderProps {
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
  onSearchComplete?: (usedSegments?: Map<string, Set<string>>, visibleHotelIds?: Set<string>, searchBounds?: { lat: number; lng: number }[]) => void;
}

export const PostcodeCommuterFinder: React.FC<PostcodeCommuterFinderProps> = ({
  stations,
  hotels,
  hotelPricing,
  selectedDate,
  onSelectHotel,
  onShowRoute,
  onSearchComplete
}) => {
  const [postcode, setPostcode] = useState('');
  const [isValidPostcode, setIsValidPostcode] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [maxJourneyTime, setMaxJourneyTime] = useState(30);
  const [showQuickPicks, setShowQuickPicks] = useState(true);
  const [allSearchResults, setAllSearchResults] = useState<any>(null); // Store all results
  const [filteredResults, setFilteredResults] = useState<any>(null); // Store filtered results
  const [expandedHotels, setExpandedHotels] = useState<Set<string>>(new Set()); // Track expanded hotels

  const handlePostcodeSubmit = () => {
    searchWithPostcode(postcode);
  };

  const findBestHotels = async (nearbyStations: any[]) => {
    const allHotelOptions: any[] = [];
    
    for (const stationInfo of nearbyStations.slice(0, 3)) { // Check top 3 nearest stations
      const workplaceStation = stationInfo.station.id;
      
      for (const hotel of hotels) {
        // Find nearest station to hotel
        let nearestStationToHotel: Station | null = null;
        let minDistance = Infinity;
        
        for (const station of stations) {
          const distance = calculateDistance(
            hotel.lat, hotel.lng,
            station.lat, station.lng
          );
          if (distance < minDistance && distance <= 800) { // Within 800m walk
            minDistance = distance;
            nearestStationToHotel = station;
          }
        }
        
        if (nearestStationToHotel) {
          const walkingMinutes = metersToWalkingMinutes(minDistance);
          const route = findRoute(nearestStationToHotel.id, workplaceStation);
          
          if (route) { // Remove time filtering here - we'll filter separately
            const priceInfo = hotelPricing.get(hotel.id);
            let price = priceInfo?.price;
            
            if (!price) {
              // Use deterministic price calculation
              price = calculateHotelPrice(hotel.id, hotel.lat, hotel.lng, selectedDate.checkIn);
            }
            
            allHotelOptions.push({
              hotel,
              workplaceStation: stationInfo.station,
              workplaceWalkTime: stationInfo.walkingMinutes,
              hotelStation: nearestStationToHotel,
              hotelWalkTime: walkingMinutes,
              tubeTime: route.estimatedTime,
              totalTime: stationInfo.walkingMinutes + route.estimatedTime + walkingMinutes,
              lineChanges: route.changes,
              price,
              totalCost: price * (selectedDate.nights || 1),
              available: priceInfo?.available !== false,
              roomsLeft: priceInfo?.roomsLeft,
              route
            });
          }
        }
      }
    }
    
    // Sort by total journey time and price balance
    allHotelOptions.sort((a, b) => {
      const scoreA = a.totalTime * 0.6 + (a.price / 200) * 0.4;
      const scoreB = b.totalTime * 0.6 + (b.price / 200) * 0.4;
      return scoreA - scoreB;
    });
    
    // Return top 5 unique hotels
    const seen = new Set();
    return allHotelOptions.filter(opt => {
      if (seen.has(opt.hotel.id)) return false;
      seen.add(opt.hotel.id);
      return true;
    }).slice(0, 20); // Get more hotels initially for better filtering
  };

  // Filter results when journey time changes
  useEffect(() => {
    if (allSearchResults && allSearchResults.hotels) {
      const filtered = allSearchResults.hotels.filter((hotel: any) => 
        hotel.totalTime <= maxJourneyTime
      );
      
      // Re-sort by score
      filtered.sort((a: any, b: any) => {
        const scoreA = a.totalTime * 0.6 + (a.price / 200) * 0.4;
        const scoreB = b.totalTime * 0.6 + (b.price / 200) * 0.4;
        return scoreA - scoreB;
      });
      
      // Recalculate used segments and visible hotels for filtered results
      const usedSegments = new Map<string, Set<string>>();
      const visibleHotelIds = new Set<string>();
      
      filtered.forEach((hotel: any) => {
        visibleHotelIds.add(hotel.hotel.id);
        
        if (hotel.route && hotel.route.segments) {
          hotel.route.segments.forEach((segment: any) => {
            if (!usedSegments.has(segment.line)) {
              usedSegments.set(segment.line, new Set());
            }
            // Store station pairs for this segment
            for (let i = 0; i < segment.stations.length - 1; i++) {
              const pair = `${segment.stations[i]}-${segment.stations[i + 1]}`;
              usedSegments.get(segment.line)?.add(pair);
            }
          });
        }
      });
      
      setSearchResults({
        ...allSearchResults,
        hotels: filtered,
        usedSegments
      });
      
      // Update map with new segments and visible hotels (no bounds change on filter)
      if (onSearchComplete) {
        onSearchComplete(usedSegments, visibleHotelIds, undefined);
      }
    }
  }, [maxJourneyTime, allSearchResults]); // Remove onSearchComplete from dependencies to prevent loop

  const searchWithPostcode = async (searchPostcode: string) => {
    if (!isValidUKPostcode(searchPostcode)) {
      setIsValidPostcode(false);
      return;
    }

    setIsSearching(true);
    setShowQuickPicks(false);
    
    // Look up postcode coordinates
    const location = await lookupPostcode(searchPostcode);
    
    if (location) {
      // Find nearest stations
      const nearbyStations = findNearestStations(location.lat, location.lng, stations);
      
      if (nearbyStations.length > 0) {
        // Auto-select closest station
        setSelectedStation(nearbyStations[0].station.id);
        
        // Find best hotels for each nearby station
        const hotelResults = await findBestHotels(nearbyStations);
        
        // Collect all line segments and hotel IDs
        const usedSegments = new Map<string, Set<string>>();
        const visibleHotelIds = new Set<string>();
        
        hotelResults.forEach((hotel: any) => {
          visibleHotelIds.add(hotel.hotel.id);
          
          if (hotel.route && hotel.route.segments) {
            hotel.route.segments.forEach((segment: any) => {
              if (!usedSegments.has(segment.line)) {
                usedSegments.set(segment.line, new Set());
              }
              // Store station pairs for this segment
              for (let i = 0; i < segment.stations.length - 1; i++) {
                const pair = `${segment.stations[i]}-${segment.stations[i + 1]}`;
                usedSegments.get(segment.line)?.add(pair);
              }
            });
          }
        });
        
        // Store all results
        const results = {
          postcode: formatPostcode(searchPostcode),
          location,
          nearbyStations,
          hotels: hotelResults,
          usedSegments,
          visibleHotelIds
        };
        setAllSearchResults(results);
        setSearchResults(results);
        
        // Calculate bounds for map zoom (include destination and hotels)
        const bounds: { lat: number; lng: number }[] = [
          location, // Search location
          ...hotelResults.slice(0, 5).map(h => ({ lat: h.hotel.lat, lng: h.hotel.lng })) // Top 5 hotels
        ];
        
        // Call the callback to show hotels on map and zoom
        if (onSearchComplete) {
          onSearchComplete(usedSegments, visibleHotelIds, bounds);
        }
      }
    } else {
      setIsValidPostcode(false);
    }
    
    setIsSearching(false);
  };

  const handleQuickPick = (quickPostcode: string) => {
    setPostcode(quickPostcode);
    setIsValidPostcode(true);
    searchWithPostcode(quickPostcode);
  };

  const toggleHotelExpand = (hotelId: string) => {
    const newExpanded = new Set(expandedHotels);
    if (newExpanded.has(hotelId)) {
      newExpanded.delete(hotelId);
    } else {
      newExpanded.add(hotelId);
    }
    setExpandedHotels(newExpanded);
  };

  const handleBookNow = (hotelOption: any) => {
    const url = selectedDate.checkIn
      ? getBookingUrl(
          hotelOption.hotel.id,
          selectedDate.checkIn,
          new Date(new Date(selectedDate.checkIn).getTime() + 
            selectedDate.nights * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          selectedDate.adults,
          selectedDate.children
        )
      : getBookingUrl(hotelOption.hotel.id);
    
    window.open(url, '_blank');
  };

  return (
    <div className="postcode-commuter-finder">
      {/* Header */}
      <div className="finder-header">
        <h3>🏨 Hotels Near Your Workplace</h3>
        <p className="subtitle">Enter your office postcode to find the perfect hotel</p>
      </div>

      {/* Postcode Input */}
      <div className="postcode-input-section">
        <div className="postcode-input-group">
          <input
            type="text"
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value.toUpperCase());
              setIsValidPostcode(true);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handlePostcodeSubmit()}
            placeholder="Enter workplace postcode (e.g., EC2M 4NS)"
            className={`postcode-input ${!isValidPostcode ? 'error' : ''}`}
            maxLength={8}
          />
          <button
            onClick={handlePostcodeSubmit}
            disabled={!postcode || isSearching}
            className="search-btn"
          >
            {isSearching ? 'Searching...' : 'Find Hotels'}
          </button>
        </div>
        
        {!isValidPostcode && (
          <p className="error-message">Please enter a valid UK postcode</p>
        )}
        
        {/* Journey Time Filter */}
        <div className="journey-filter">
          <label>
            Max journey time: <strong>{maxJourneyTime} minutes</strong>
          </label>
          <input
            type="range"
            min="15"
            max="60"
            step="5"
            value={maxJourneyTime}
            onChange={(e) => setMaxJourneyTime(parseInt(e.target.value))}
            className="time-slider"
          />
        </div>
      </div>

      {/* Quick Pick Postcodes */}
      {showQuickPicks && (
        <div className="quick-picks">
          <label>Popular business areas:</label>
          <div className="quick-pick-grid">
            {popularPostcodes.slice(0, 6).map(item => (
              <button
                key={item.postcode}
                onClick={() => handleQuickPick(item.postcode)}
                className="quick-pick-btn"
              >
                <strong>{item.area}</strong>
                <span>{item.postcode}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="loading-results">
          <div className="spinner"></div>
          <p>Finding perfect hotels near {formatPostcode(postcode)}...</p>
        </div>
      )}

      {/* Results */}
      {searchResults && !isSearching && (
        <div className="search-results">
          <div className="results-header">
            <h4>Hotels near {searchResults.postcode}</h4>
            <p className="station-info">
              Nearest station: <strong>{searchResults.nearbyStations[0].station.name}</strong> 
              ({searchResults.nearbyStations[0].walkingMinutes} min walk)
            </p>
          </div>

          {/* Alternative Stations */}
          {searchResults.nearbyStations.length > 1 && (
            <div className="station-options">
              <label>Try from different station:</label>
              <div className="station-pills">
                {searchResults.nearbyStations.slice(0, 3).map((s: any) => (
                  <button
                    key={s.station.id}
                    onClick={() => {
                      setSelectedStation(s.station.id);
                      // Just update the selected station without recalculating
                      // This keeps the data static as requested
                    }}
                    className={`station-pill ${selectedStation === s.station.id ? 'active' : ''}`}
                  >
                    {s.station.name} ({s.walkingMinutes} min)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hotel Results */}
          <div className="hotel-results">
            {searchResults.hotels.length > 0 ? (
              <>
                {/* Hero Recommendation */}
                {searchResults.hotels[0] && (
                  <div className="hero-hotel">
                    <div className="hero-badge">🏆 BEST MATCH</div>
                    
                    <div className="hero-content">
                      <div className="hero-info">
                        <h5>{searchResults.hotels[0].hotel.name}</h5>
                        <p className="hero-area">{searchResults.hotels[0].hotel.area}</p>
                        
                        <div className="journey-breakdown">
                          <div className="journey-step">
                            <span className="step-icon">🏨</span>
                            <span>{searchResults.hotels[0].hotelWalkTime} min walk to {searchResults.hotels[0].hotelStation.name}</span>
                          </div>
                          <div className="journey-step">
                            <span className="step-icon">🚇</span>
                            <span>{searchResults.hotels[0].tubeTime} min tube journey
                              {searchResults.hotels[0].lineChanges > 0 && 
                                ` (${searchResults.hotels[0].lineChanges} change${searchResults.hotels[0].lineChanges > 1 ? 's' : ''})`}
                            </span>
                          </div>
                          <div className="journey-step">
                            <span className="step-icon">🚶</span>
                            <span>{searchResults.hotels[0].workplaceWalkTime} min walk to office</span>
                          </div>
                        </div>
                        
                        <div className="journey-total">
                          Total journey: <strong>{searchResults.hotels[0].totalTime} minutes</strong>
                        </div>
                      </div>
                      
                      <div className="hero-booking">
                        <div className="hero-price">
                          <span className="price-amount">£{searchResults.hotels[0].price}</span>
                          <span className="price-period">per night</span>
                        </div>
                        
                        {selectedDate.nights > 1 && (
                          <div className="total-stay">
                            {selectedDate.nights} nights: £{searchResults.hotels[0].totalCost}
                          </div>
                        )}
                        
                        {searchResults.hotels[0].roomsLeft && searchResults.hotels[0].roomsLeft <= 3 && (
                          <div className="urgency">🔥 Only {searchResults.hotels[0].roomsLeft} left!</div>
                        )}
                        
                        <button
                          className="hero-book-btn"
                          onClick={() => handleBookNow(searchResults.hotels[0])}
                          disabled={!searchResults.hotels[0].available}
                        >
                          {searchResults.hotels[0].available ? 'Book Now →' : 'Sold Out'}
                        </button>
                        
                        <button
                          className="view-map-btn"
                          onClick={() => {
                            onSelectHotel(searchResults.hotels[0].hotel);
                            onShowRoute(searchResults.hotels[0].hotelStation.id, searchResults.hotels[0].workplaceStation.id);
                          }}
                        >
                          View Route
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Options */}
                {searchResults.hotels.length > 1 && (
                  <div className="other-options">
                    <h5>Other great options:</h5>
                    <div className="option-list">
                      {searchResults.hotels.slice(1, 5).map((opt: any, idx: number) => {
                        const isExpanded = expandedHotels.has(opt.hotel.id);
                        return (
                          <div key={idx} className={`option-item ${isExpanded ? 'expanded' : ''}`}>
                            <div 
                              className="option-header"
                              onClick={() => toggleHotelExpand(opt.hotel.id)}
                            >
                              <div className="option-info">
                                <strong>{opt.hotel.name}</strong>
                                <span className="option-stats">
                                  {opt.totalTime} min • £{opt.price}/night
                                  {opt.lineChanges === 0 && ' • Direct'}
                                </span>
                              </div>
                              <button className="expand-btn">
                                {isExpanded ? '−' : '+'}
                              </button>
                            </div>
                            
                            {isExpanded && (
                              <div className="option-details">
                                <div className="journey-breakdown compact">
                                  <div className="journey-step">
                                    <span className="step-icon">🏨</span>
                                    <span>{opt.hotelWalkTime} min walk to {opt.hotelStation.name}</span>
                                  </div>
                                  <div className="journey-step">
                                    <span className="step-icon">🚇</span>
                                    <span>{opt.tubeTime} min journey
                                      {opt.lineChanges > 0 && ` (${opt.lineChanges} change${opt.lineChanges > 1 ? 's' : ''})`}
                                    </span>
                                  </div>
                                  <div className="journey-step">
                                    <span className="step-icon">🚶</span>
                                    <span>{opt.workplaceWalkTime} min to destination</span>
                                  </div>
                                </div>
                                
                                <div className="option-actions-expanded">
                                  <button
                                    className="view-route-btn compact"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectHotel(opt.hotel);
                                      onShowRoute(opt.hotelStation.id, opt.workplaceStation.id);
                                    }}
                                  >
                                    View Route
                                  </button>
                                  <button
                                    className="book-btn compact"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBookNow(opt);
                                    }}
                                    disabled={!opt.available}
                                  >
                                    {opt.available ? 'Book Now' : 'Sold Out'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <p>😕 No hotels found within {maxJourneyTime} minutes</p>
                <p>Try increasing the journey time or entering a different postcode</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust Elements */}
      <div className="trust-bar">
        <span>✓ Real-time availability</span>
        <span>✓ Best price guarantee</span>
        <span>✓ Free cancellation</span>
      </div>
    </div>
  );
};