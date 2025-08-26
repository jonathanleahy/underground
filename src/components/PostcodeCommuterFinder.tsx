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
  onSelectHotel: (hotel: any, hotelDetails?: any) => void;
  onShowRoute: (fromStation: string, toStation: string, hotelLocation?: { lat: number; lng: number }) => void;
  onSearchComplete?: (usedSegments?: Map<string, Set<string>>, visibleHotelIds?: Set<string>, searchBounds?: { lat: number; lng: number }[], workLocation?: { lat: number; lng: number; postcode: string }) => void;
  highlightedHotelId?: string | null;
}

export const PostcodeCommuterFinder: React.FC<PostcodeCommuterFinderProps> = ({
  stations,
  hotels,
  hotelPricing,
  selectedDate,
  onSelectHotel,
  onShowRoute,
  onSearchComplete,
  highlightedHotelId
}) => {
  const [postcode, setPostcode] = useState('');
  const [isValidPostcode, setIsValidPostcode] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [maxJourneyTime, setMaxJourneyTime] = useState(30);
  const [maxPrice, setMaxPrice] = useState(200); // Max price per night
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 }); // Actual price range from results
  const [showQuickPicks, setShowQuickPicks] = useState(true);
  const [allSearchResults, setAllSearchResults] = useState<any>(null); // Store all results
  const [filteredResults, setFilteredResults] = useState<any>(null); // Store filtered results
  const [expandedHotels, setExpandedHotels] = useState<Set<string>>(new Set()); // Track expanded hotels
  const [selectedHotels, setSelectedHotels] = useState<Set<string>>(new Set()); // Track selected hotels for map display
  
  // Date and guest selection
  const [checkInDate, setCheckInDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [nights, setNights] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

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
              // Use deterministic price calculation with current date
              price = calculateHotelPrice(hotel.id, hotel.lat, hotel.lng, checkInDate);
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
              totalCost: price * nights,
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
    }); // Return ALL hotels, let the time filter handle limiting
  };

  // Filter results when journey time or price changes
  useEffect(() => {
    if (allSearchResults && allSearchResults.hotels) {
      console.log('=== PRICE FILTER DEBUG ===');
      console.log('Filtering hotels - Max Journey Time:', maxJourneyTime, 'Max Price:', maxPrice);
      console.log('Total hotels before filter:', allSearchResults.hotels.length);
      
      const filtered = allSearchResults.hotels.filter((hotel: any) => {
        const passes = hotel.totalTime <= maxJourneyTime && hotel.price <= maxPrice;
        if (!passes && hotel.price > maxPrice) {
          console.log(`Filtering out ${hotel.hotel.name}: price ${hotel.price} > max ${maxPrice}`);
        }
        return passes;
      });
      
      console.log(`Filtered ${allSearchResults.hotels.length} hotels to ${filtered.length}`);
      console.log('Filtered hotel IDs:', filtered.map((h: any) => `${h.hotel.name} (${h.hotel.id}): £${h.price}`));
      
      // Re-sort by score
      filtered.sort((a: any, b: any) => {
        const scoreA = a.totalTime * 0.6 + (a.price / 200) * 0.4;
        const scoreB = b.totalTime * 0.6 + (b.price / 200) * 0.4;
        return scoreA - scoreB;
      });
      
      // Recalculate used segments, visible hotels and bounds for filtered results
      const usedSegments = new Map<string, Set<string>>();
      const visibleHotelIds = new Set<string>();
      const bounds: { lat: number; lng: number }[] = [];
      
      filtered.forEach((hotel: any) => {
        visibleHotelIds.add(hotel.hotel.id);
        bounds.push({ lat: hotel.hotel.lat, lng: hotel.hotel.lng });
        
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
      
      // Add workplace location to bounds
      if (allSearchResults.location) {
        bounds.push({
          lat: allSearchResults.location.lat,
          lng: allSearchResults.location.lng
        });
      }
      
      setSearchResults({
        ...allSearchResults,
        hotels: filtered,
        usedSegments
      });
      
      setFilteredResults({ ...allSearchResults, hotels: filtered });
      
      // Reset selected hotels to all filtered hotels
      const allFilteredIds = new Set(filtered.map((h: any) => h.hotel.id));
      setSelectedHotels(allFilteredIds);
      
      // ONLY update map here, not in updateMapWithSelectedHotels to avoid race conditions
      // Update map with new segments, visible hotels and proper bounds
      if (onSearchComplete && allSearchResults.location) {
        console.log('Passing visibleHotelIds to map:', Array.from(visibleHotelIds));
        console.log('Passing filtered results with', filtered.length, 'hotels');
        onSearchComplete(
          usedSegments, 
          visibleHotelIds, 
          bounds,
          {
            lat: allSearchResults.location.lat,
            lng: allSearchResults.location.lng,
            postcode: allSearchResults.formattedPostcode || allSearchResults.postcode
          },
          { ...allSearchResults, hotels: filtered } // Pass the properly filtered results
        );
      }
    }
  }, [maxJourneyTime, maxPrice, allSearchResults]); // Remove onSearchComplete from dependencies to prevent loop

  const searchWithPostcode = async (searchPostcode: string) => {
    if (!isValidUKPostcode(searchPostcode)) {
      setIsValidPostcode(false);
      return;
    }

    setIsSearching(true);
    setShowQuickPicks(false);
    
    // Look up postcode coordinates
    console.log('Searching for postcode:', searchPostcode);
    const location = await lookupPostcode(searchPostcode);
    console.log('Postcode lookup result:', location);
    
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
        
        // Calculate price range from results
        if (hotelResults.length > 0) {
          const prices = hotelResults.map((h: any) => h.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange({ min: minPrice, max: maxPrice });
          setMaxPrice(maxPrice); // Set initial filter to max price
        }
        
        // Store all results
        const results = {
          postcode: formatPostcode(searchPostcode),
          location,
          nearbyStations,
          hotels: hotelResults,
          usedSegments,
          visibleHotelIds,
          formattedPostcode: formatPostcode(searchPostcode) // Store formatted postcode
        };
        setAllSearchResults(results);
        setSearchResults(results);
        
        // Initialize all hotels as selected
        const allHotelIds = new Set(hotelResults.map((h: any) => h.hotel.id));
        setSelectedHotels(allHotelIds);
        
        // Calculate bounds for map zoom (include destination and hotels)
        const bounds: { lat: number; lng: number }[] = [
          location, // Search location
          ...hotelResults.slice(0, 5).map(h => ({ lat: h.hotel.lat, lng: h.hotel.lng })) // Top 5 hotels
        ];
        
        // Call the callback to show hotels on map and zoom, including workplace location
        if (onSearchComplete && location) {
          onSearchComplete(usedSegments, visibleHotelIds, bounds, {
            lat: location.lat,
            lng: location.lng,
            postcode: formatPostcode(searchPostcode)
          }, searchResults);
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

  const handleHotelClick = (hotel: any) => {
    // Always pass full hotel details to parent to show the details panel
    onSelectHotel(hotel.hotel, hotel);
    
    // Show route if we have valid stations - this will also trigger viewport update
    if (hotel.hotelStation && hotel.workplaceStation) {
      onShowRoute(
        hotel.hotelStation.id,
        hotel.workplaceStation.id,
        { lat: hotel.hotel.lat, lng: hotel.hotel.lng }
      );
    }
    
    // Also expand the hotel in the left panel
    const newExpanded = new Set(expandedHotels);
    if (!newExpanded.has(hotel.hotel.id)) {
      newExpanded.add(hotel.hotel.id);
      setExpandedHotels(newExpanded);
    }
  };
  
  const toggleHotelSelection = (hotelId: string) => {
    const newSelected = new Set(selectedHotels);
    if (newSelected.has(hotelId)) {
      newSelected.delete(hotelId);
    } else {
      newSelected.add(hotelId);
    }
    setSelectedHotels(newSelected);
    // Don't call updateMapWithSelectedHotels here - let the useEffect handle it
    // updateMapWithSelectedHotels(newSelected);
  };
  
  const selectAllHotels = () => {
    if (filteredResults && filteredResults.hotels) {
      const allIds = new Set(filteredResults.hotels.map((h: any) => h.hotel.id));
      setSelectedHotels(allIds);
      // Don't call updateMapWithSelectedHotels here - let the useEffect handle it
    }
  };
  
  const clearAllHotels = () => {
    setSelectedHotels(new Set());
    // Don't call updateMapWithSelectedHotels here - let the useEffect handle it
  };
  
  // Removed updateMapWithSelectedHotels to avoid race conditions
  // All map updates now happen through the main filtering useEffect

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
      {/* Date and Guest Selection */}
      <div className="date-guest-section">
        <div className="date-inputs">
          <div className="input-group">
            <label>Check-in Date</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="date-input"
            />
          </div>
          <div className="input-group">
            <label>Nights</label>
            <select 
              value={nights} 
              onChange={(e) => setNights(Number(e.target.value))}
              className="nights-select"
            >
              {[1,2,3,4,5,6,7,14,21,28].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'night' : 'nights'}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="guest-inputs">
          <div className="input-group">
            <label>Adults</label>
            <select 
              value={adults} 
              onChange={(e) => setAdults(Number(e.target.value))}
              className="guest-select"
            >
              {[1,2,3,4].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'adult' : 'adults'}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Children</label>
            <select 
              value={children} 
              onChange={(e) => setChildren(Number(e.target.value))}
              className="guest-select"
            >
              {[0,1,2,3,4].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'child' : 'children'}</option>
              ))}
            </select>
          </div>
        </div>
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
            max="90"
            step="5"
            value={maxJourneyTime}
            onChange={(e) => setMaxJourneyTime(parseInt(e.target.value))}
            className="time-slider"
          />
          <div className="time-guides">
            <button 
              onClick={() => setMaxJourneyTime(30)}
              className={maxJourneyTime <= 30 ? 'active' : ''}
            >
              Short (≤30min)
            </button>
            <button 
              onClick={() => setMaxJourneyTime(45)}
              className={maxJourneyTime > 30 && maxJourneyTime <= 60 ? 'active' : ''}
            >
              Medium (30-60min)
            </button>
            <button 
              onClick={() => setMaxJourneyTime(75)}
              className={maxJourneyTime > 60 ? 'active' : ''}
            >
              Long (60-90min)
            </button>
          </div>
        </div>
        
        {/* Price Filter - Show when we have ALL search results, even if filtered to zero */}
        {allSearchResults && allSearchResults.hotels && allSearchResults.hotels.length > 0 && (
          <div className="price-filter">
            <label>
              Max price: <strong>£{maxPrice}</strong> per night
              {maxPrice < priceRange.min && (
                <span style={{ color: '#dc2626', marginLeft: '8px', fontSize: '12px' }}>
                  (below minimum price)
                </span>
              )}
            </label>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              step="5"
              value={Math.max(maxPrice, priceRange.min)} // Ensure slider doesn't go below min
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                // Allow setting to any value within range
                setMaxPrice(newValue);
              }}
              className="price-slider"
            />
            <div className="price-range-info">
              <span>£{priceRange.min}</span>
              <span>£{priceRange.max}</span>
            </div>
          </div>
        )}
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
      {searchResults && !isSearching && (() => {
        // Use filtered results if available, otherwise use original search results
        const displayHotels = filteredResults?.hotels || searchResults.hotels || [];
        
        return (
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
            {displayHotels.length > 0 ? (
              <>
                {/* Hero Recommendation */}
                {displayHotels[0] && (
                  <div 
                    className={`hero-hotel ${highlightedHotelId === displayHotels[0].hotel.id ? 'highlighted' : ''}`}
                    onClick={() => handleHotelClick(displayHotels[0])}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="hero-badge">🏆 BEST MATCH</div>
                    
                    <div className="hero-content">
                      <div className="hero-info">
                        <h5>{displayHotels[0].hotel.name}</h5>
                        <p className="hero-area">{displayHotels[0].hotel.area}</p>
                        
                        <div className="journey-breakdown">
                          <div className="journey-step">
                            <span className="step-icon">🏨</span>
                            <span>{displayHotels[0].hotelWalkTime} min walk to {displayHotels[0].hotelStation.name}</span>
                          </div>
                          <div className="journey-step">
                            <span className="step-icon">🚇</span>
                            <span>{displayHotels[0].tubeTime} min tube journey
                              {displayHotels[0].lineChanges > 0 && 
                                ` (${displayHotels[0].lineChanges} change${displayHotels[0].lineChanges > 1 ? 's' : ''})`}
                            </span>
                          </div>
                          <div className="journey-step">
                            <span className="step-icon">🚶</span>
                            <span>{displayHotels[0].workplaceWalkTime} min walk to office</span>
                          </div>
                        </div>
                        
                        <div className="journey-total">
                          Total journey: <strong>{displayHotels[0].totalTime} minutes</strong>
                        </div>
                      </div>
                      
                      <div className="hero-booking">
                        <div className="hero-price">
                          <span className="price-amount">£{displayHotels[0].price}</span>
                          <span className="price-period">per night</span>
                        </div>
                        
                        {selectedDate.nights > 1 && (
                          <div className="total-stay">
                            {selectedDate.nights} nights: £{displayHotels[0].totalCost}
                          </div>
                        )}
                        
                        {displayHotels[0].roomsLeft && displayHotels[0].roomsLeft <= 3 && (
                          <div className="urgency">🔥 Only {displayHotels[0].roomsLeft} left!</div>
                        )}
                        
                        <button
                          className="hero-book-btn"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the card click
                            handleBookNow(displayHotels[0]);
                          }}
                          disabled={!displayHotels[0].available}
                        >
                          {displayHotels[0].available ? 'Book Now →' : 'Sold Out'}
                        </button>
                        
                        <button
                          className="view-map-btn"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the card click
                            onSelectHotel(displayHotels[0].hotel, displayHotels[0]);
                            onShowRoute(
                              displayHotels[0].hotelStation.id, 
                              displayHotels[0].workplaceStation.id,
                              { lat: displayHotels[0].hotel.lat, lng: displayHotels[0].hotel.lng }
                            );
                          }}
                        >
                          View Route
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Options */}
                {displayHotels.length > 1 && (
                  <div className="other-options">
                    <div className="options-header">
                      <h5>Other great options:</h5>
                      <div className="selection-controls">
                        <button onClick={selectAllHotels} className="select-btn">Select All</button>
                        <button onClick={clearAllHotels} className="select-btn">Clear</button>
                        <span className="selection-count">{selectedHotels.size} selected</span>
                      </div>
                    </div>
                    <div className="option-list">
                      {displayHotels.slice(1, 5).map((opt: any, idx: number) => {
                        const isExpanded = expandedHotels.has(opt.hotel.id);
                        const isSelected = selectedHotels.has(opt.hotel.id);
                        const isHighlighted = highlightedHotelId === opt.hotel.id;
                        return (
                          <div key={idx} className={`option-item ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}>
                            <div className="option-header">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleHotelSelection(opt.hotel.id)}
                                className="hotel-checkbox"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div 
                                className="option-header-content"
                                onClick={() => handleHotelClick(opt)}
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
                                      onSelectHotel(opt.hotel, opt);
                                      onShowRoute(
                                        opt.hotelStation.id, 
                                        opt.workplaceStation.id,
                                        { lat: opt.hotel.lat, lng: opt.hotel.lng }
                                      );
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
                <p>😕 No hotels found within your filters</p>
                {allSearchResults && allSearchResults.hotels && allSearchResults.hotels.length > 0 ? (
                  <>
                    <p>Try adjusting your filters:</p>
                    <ul style={{ textAlign: 'left', marginTop: '8px' }}>
                      <li>Journey time: currently {maxJourneyTime} minutes</li>
                      <li>Max price: currently £{maxPrice} per night</li>
                    </ul>
                    <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                      {allSearchResults.hotels.length} hotels available before filtering
                    </p>
                  </>
                ) : (
                  <p>Try entering a different postcode</p>
                )}
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* Trust Elements */}
      <div className="trust-bar">
        <span>✓ Real-time availability</span>
        <span>✓ Best price guarantee</span>
        <span>✓ Free cancellation</span>
      </div>
    </div>
  );
};