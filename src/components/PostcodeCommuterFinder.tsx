import React, { useState, useEffect } from 'react';
import { Station } from '../types/underground';
import { findRoute } from '../services/routingService';
import { calculateDistance, metersToWalkingMinutes } from '../utils/distance';
import { calculateHotelPrice } from '../utils/priceCalculator';
import { 
  lookupPostcode, 
  findNearestStations, 
  popularPostcodes, 
  isValidUKPostcode, 
  formatPostcode,
  lookupDestination,
  getPopularDestinations 
} from '../services/postcodeService';
import { getBookingUrl } from '../data/premier-inn-urls';
import './PostcodeCommuterFinder.css';

// Generate star ratings for hotels (Premier Inn typically 3-4 stars)
const getHotelStarRating = (hotelId: string): number => {
  // Hub hotels are typically newer and get higher ratings
  if (hotelId.includes('hub')) return 4.5;
  
  // Central London hotels tend to be busier but well-maintained
  const centralHotels = ['county-hall', 'bank-tower', 'euston', 'kings-cross'];
  if (centralHotels.some(name => hotelId.includes(name))) return 4;
  
  // Airport hotels
  if (hotelId.includes('heathrow') || hotelId.includes('gatwick')) return 3.5;
  
  // Most Premier Inns are solid 3.5-4 stars
  return 3.5 + (Math.floor(hotelId.charCodeAt(10) || 0) % 10) / 10; // Consistent per hotel
};

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
  const [minJourneyTime, setMinJourneyTime] = useState(0); // Min journey time filter
  const [maxJourneyTime, setMaxJourneyTime] = useState(30); // Max journey time filter
  const [minPrice, setMinPrice] = useState(0); // Min price filter
  const [maxPrice, setMaxPrice] = useState(200); // Max price filter
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 }); // Actual price range from results
  const [minStarRating, setMinStarRating] = useState(3); // Min star rating filter
  const [maxStarRating, setMaxStarRating] = useState(5); // Max star rating filter
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
              route,
              starRating: getHotelStarRating(hotel.id)
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
      // Apply filters to hotels
      
      const filtered = allSearchResults.hotels.filter((hotel: any) => {
        const rating = hotel.starRating || 3.5;
        const passes = hotel.totalTime >= minJourneyTime && hotel.totalTime <= maxJourneyTime && 
                       hotel.price >= minPrice && hotel.price <= maxPrice &&
                       rating >= minStarRating && rating <= maxStarRating;
        if (!passes) {
          if (hotel.price < minPrice || hotel.price > maxPrice) {
            // Price out of range
          }
          if (rating < minStarRating || rating > maxStarRating) {
            // Rating out of range
          }
        }
        return passes;
      });
      
      // Hotels filtered based on criteria
      
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
        // Pass visible hotel IDs and filtered results to map
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
  }, [minJourneyTime, maxJourneyTime, minPrice, maxPrice, minStarRating, maxStarRating, allSearchResults]); // Remove onSearchComplete from dependencies to prevent loop

  const searchWithPostcode = async (searchQuery: string) => {
    setIsSearching(true);
    setShowQuickPicks(false);
    
    // Look up destination (postcode, landmark, or place)
    const location = await lookupDestination(searchQuery);
    
    if (location) {
      // Update postcode display with the location name
      setPostcode(location.name || searchQuery);
      setIsValidPostcode(true);
      
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
          const minPriceVal = Math.min(...prices);
          const maxPriceVal = Math.max(...prices);
          setPriceRange({ min: minPriceVal, max: maxPriceVal });
          
          // Only set initial filter values if they haven't been customized
          // (i.e., if they're still at their default values)
          if (minPrice === 0 && maxPrice === 200) {
            setMinPrice(minPriceVal); // Set initial min filter
            setMaxPrice(maxPriceVal); // Set initial max filter
          }
        }
        
        // Store all results
        const results = {
          postcode: location.name || searchQuery,
          location,
          nearbyStations,
          hotels: hotelResults,
          usedSegments,
          visibleHotelIds,
          formattedPostcode: location.name || searchQuery // Store formatted location name
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
            postcode: location.name || searchQuery
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
              setPostcode(e.target.value);
              setIsValidPostcode(true);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handlePostcodeSubmit()}
            placeholder="Enter destination (e.g., British Museum, EC2M 4NS)"
            className={`postcode-input ${!isValidPostcode ? 'error' : ''}`}
            maxLength={50}
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
          <p className="error-message">Could not find destination. Try a postcode or landmark name.</p>
        )}
        
        {/* Journey Time Filter */}
        <div className="journey-filter">
          <label>
            Journey time: <strong>{minJourneyTime} - {maxJourneyTime} minutes</strong>
          </label>
          <div className="time-slider-container">
            <div className="dual-slider-track" style={{
              background: `linear-gradient(to right, 
                #22c55e 0%, 
                #22c55e 33%, 
                #3b82f6 33%, 
                #3b82f6 66%, 
                #ef4444 66%, 
                #ef4444 100%)`,
              height: '6px',
              borderRadius: '3px',
              position: 'relative',
              marginBottom: '8px'
            }}>
              <div className="selected-range" style={{
                position: 'absolute',
                left: `${((minJourneyTime - 0) / 90) * 100}%`,
                right: `${((90 - maxJourneyTime) / 90) * 100}%`,
                height: '100%',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '3px'
              }}></div>
            </div>
            <div style={{ position: 'relative', height: '20px' }}>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minJourneyTime}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (newValue <= maxJourneyTime) {
                    setMinJourneyTime(newValue);
                  }
                }}
                className="time-slider time-slider-min"
                style={{ position: 'absolute', pointerEvents: 'none', background: 'transparent' }}
              />
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={maxJourneyTime}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (newValue >= minJourneyTime) {
                    setMaxJourneyTime(newValue);
                  }
                }}
                className="time-slider time-slider-max"
                style={{ background: 'transparent' }}
              />
            </div>
            <div className="time-range-info">
              <span>0m</span>
              <span>90m</span>
            </div>
            <div className="time-segments">
              <div className="segment quick">Quick</div>
              <div className="segment moderate">Moderate</div>
              <div className="segment long">Long</div>
            </div>
          </div>
          <div className="time-guides">
            <button 
              onClick={() => { setMinJourneyTime(0); setMaxJourneyTime(30); }}
              className={(minJourneyTime === 0 && maxJourneyTime === 30) ? 'active' : ''}
            >
              Short (0-30min)
            </button>
            <button 
              onClick={() => { setMinJourneyTime(30); setMaxJourneyTime(60); }}
              className={(minJourneyTime === 30 && maxJourneyTime === 60) ? 'active' : ''}
            >
              Medium (30-60min)
            </button>
            <button 
              onClick={() => { setMinJourneyTime(60); setMaxJourneyTime(90); }}
              className={(minJourneyTime === 60 && maxJourneyTime === 90) ? 'active' : ''}
            >
              Long (60-90min)
            </button>
          </div>
        </div>
        
        {/* Star Rating Filter */}
        <div className="star-filter">
          <label>
            Star rating: <strong>{minStarRating.toFixed(1)} - {maxStarRating.toFixed(1)}</strong> stars
          </label>
          <div className="star-slider-container">
            <div className="dual-slider-track" style={{
              background: `linear-gradient(to right, 
                #ef4444 0%, 
                #ef4444 20%, 
                #f97316 20%, 
                #f97316 40%, 
                #fbbf24 40%, 
                #fbbf24 60%, 
                #22c55e 60%, 
                #22c55e 80%, 
                #3b82f6 80%, 
                #3b82f6 100%)`,
              height: '6px',
              borderRadius: '3px',
              position: 'relative',
              marginBottom: '8px'
            }}>
              <div className="selected-range" style={{
                position: 'absolute',
                left: `${((minStarRating - 3) / 2) * 100}%`,
                right: `${((5 - maxStarRating) / 2) * 100}%`,
                height: '100%',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '3px'
              }}></div>
            </div>
            <div style={{ position: 'relative', height: '20px' }}>
              <input
                type="range"
                min="3"
                max="5"
                step="0.1"
                value={minStarRating}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value);
                  if (newValue <= maxStarRating) {
                    setMinStarRating(newValue);
                  }
                }}
                className="star-slider star-slider-min"
                style={{ position: 'absolute', pointerEvents: 'none', background: 'transparent' }}
              />
              <input
                type="range"
                min="3"
                max="5"
                step="0.1"
                value={maxStarRating}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value);
                  if (newValue >= minStarRating) {
                    setMaxStarRating(newValue);
                  }
                }}
                className="star-slider star-slider-max"
                style={{ background: 'transparent' }}
              />
            </div>
            <div className="star-range-info">
              <span>⭐⭐⭐</span>
              <span>⭐⭐⭐⭐⭐</span>
            </div>
            <div className="star-segments">
              <div className="segment basic">Basic</div>
              <div className="segment good">Good</div>
              <div className="segment excellent">Excellent</div>
            </div>
          </div>
        </div>
        
        {/* Price Filter - Show when we have ALL search results, even if filtered to zero */}
        {allSearchResults && allSearchResults.hotels && allSearchResults.hotels.length > 0 && (
          <div className="price-filter">
            <label>
              Price range: <strong>£{minPrice} - £{maxPrice}</strong> per night
            </label>
            <div className="price-slider-container">
              <div className="dual-slider-track" style={{
                background: `linear-gradient(to right, 
                  #22c55e 0%, 
                  #22c55e 33%, 
                  #3b82f6 33%, 
                  #3b82f6 66%, 
                  #a855f7 66%, 
                  #a855f7 100%)`,
                height: '6px',
                borderRadius: '3px',
                position: 'relative',
                marginBottom: '8px'
              }}>
                <div className="selected-range" style={{
                  position: 'absolute',
                  left: `${((minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                  right: `${((priceRange.max - maxPrice) / (priceRange.max - priceRange.min)) * 100}%`,
                  height: '100%',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '3px'
                }}></div>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step="5"
                  value={minPrice}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    if (newValue <= maxPrice) {
                      setMinPrice(newValue);
                    }
                  }}
                  className="price-slider price-slider-min"
                  style={{ position: 'absolute', pointerEvents: 'none' }}
                />
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step="5"
                  value={maxPrice}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    if (newValue >= minPrice) {
                      setMaxPrice(newValue);
                    }
                  }}
                  className="price-slider price-slider-max"
                />
              </div>
              <div className="price-range-info">
                <span className="price-min">£{priceRange.min}</span>
                <span className="price-max">£{priceRange.max}</span>
              </div>
              <div className="price-segments">
                <div className="segment budget">Budget</div>
                <div className="segment mid">Mid</div>
                <div className="segment premium">Premium</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Picks */}
      {showQuickPicks && (
        <>
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
          
          <div className="quick-picks" style={{ marginTop: '16px' }}>
            <label>Popular destinations:</label>
            <div className="quick-pick-grid">
              {getPopularDestinations().slice(0, 6).map(dest => (
                <button
                  key={dest.query}
                  onClick={() => handleQuickPick(dest.query)}
                  className="quick-pick-btn destination-btn"
                  title={dest.name}
                >
                  <span style={{ fontSize: '20px' }}>{dest.icon}</span>
                  <strong style={{ fontSize: '12px' }}>{dest.name}</strong>
                </button>
              ))}
            </div>
          </div>
        </>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ color: '#fbbf24', fontSize: '14px' }}>{'⭐'.repeat(Math.floor(displayHotels[0].starRating || 3.5))}</span>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>{(displayHotels[0].starRating || 3.5).toFixed(1)}</span>
                        </div>
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
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                                    <span style={{ color: '#fbbf24', fontSize: '12px' }}>{'⭐'.repeat(Math.floor(opt.starRating || 3.5))}</span>
                                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{(opt.starRating || 3.5).toFixed(1)}</span>
                                  </div>
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