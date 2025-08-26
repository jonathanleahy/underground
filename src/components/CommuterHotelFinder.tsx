import React, { useState, useEffect, useMemo } from 'react';
import { findRoute, Route } from '../services/routingService';
import { Station } from '../types/underground';
import { Premier } from '../services/premier-inn-api';
import { calculateDistance, metersToWalkingMinutes } from '../utils/distance';
import './CommuterHotelFinder.css';

interface CommuterHotelFinderProps {
  stations: Station[];
  hotels: any[];
  hotelPricing: Map<string, any>;
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
  score: number;
}

type SortOption = 'time' | 'price' | 'score';

export const CommuterHotelFinder: React.FC<CommuterHotelFinderProps> = ({
  stations,
  hotels,
  hotelPricing,
  onSelectHotel,
  onShowRoute
}) => {
  const [workplaceStation, setWorkplaceStation] = useState<string>('tottenham-court-road');
  const [maxCommuteTime, setMaxCommuteTime] = useState<number>(30);
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [isCalculating, setIsCalculating] = useState(false);
  const [hotelsWithCommute, setHotelsWithCommute] = useState<HotelWithCommute[]>([]);
  
  // Remove routingService as we'll use the findRoute function directly

  // Calculate commute times for all hotels
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
            
            // Calculate score (lower is better)
            const priceInfo = hotelPricing.get(hotel.id);
            const price = priceInfo?.price || 999;
            const timeScore = totalMinutes / 60; // Normalize to 0-1 range (assuming max 60 min)
            const priceScore = price / 200; // Normalize to 0-1 range (assuming max £200)
            const walkScore = walkingMinutes / 15; // Normalize to 0-1 range (assuming max 15 min walk)
            
            // Weighted score
            const score = (timeScore * 0.4) + (priceScore * 0.4) + (walkScore * 0.2);
            
            results.push({
              hotel,
              nearestStation,
              walkingMinutes,
              commuteMinutes,
              totalMinutes,
              route,
              score
            });
          }
        }
      }
      
      setHotelsWithCommute(results);
      setIsCalculating(false);
    };
    
    calculateCommutes();
  }, [workplaceStation, hotels, hotelPricing, stations]);

  // Filter and sort hotels
  const filteredAndSortedHotels = useMemo(() => {
    let filtered = hotelsWithCommute.filter(h => h.totalMinutes <= maxCommuteTime);
    
    // Sort based on selected option
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return a.totalMinutes - b.totalMinutes;
        case 'price':
          const priceA = hotelPricing.get(a.hotel.id)?.price || 999;
          const priceB = hotelPricing.get(b.hotel.id)?.price || 999;
          return priceA - priceB;
        case 'score':
          return a.score - b.score;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [hotelsWithCommute, maxCommuteTime, sortBy, hotelPricing]);

  const handleSelectHotel = (hotelWithCommute: HotelWithCommute) => {
    onSelectHotel(hotelWithCommute.hotel);
    if (hotelWithCommute.nearestStation) {
      onShowRoute(hotelWithCommute.nearestStation.id, workplaceStation);
    }
  };

  return (
    <div className="commuter-hotel-finder">
      <h3>🚇 Commuter Hotel Finder</h3>
      <p className="finder-description">
        Find hotels with easy tube access to your workplace
      </p>
      
      <div className="finder-controls">
        <div className="control-group">
          <label htmlFor="workplace-station">Workplace Station:</label>
          <select
            id="workplace-station"
            value={workplaceStation}
            onChange={(e) => setWorkplaceStation(e.target.value)}
            className="station-select"
          >
            <option value="">Select a station...</option>
            {stations
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="max-commute">
            Max Commute Time: <strong>{maxCommuteTime} min</strong>
          </label>
          <input
            id="max-commute"
            type="range"
            min="10"
            max="60"
            step="5"
            value={maxCommuteTime}
            onChange={(e) => setMaxCommuteTime(parseInt(e.target.value))}
            className="time-slider"
          />
          <div className="slider-labels">
            <span>10 min</span>
            <span>60 min</span>
          </div>
        </div>
        
        <div className="control-group">
          <label>Sort by:</label>
          <div className="sort-buttons">
            <button
              className={sortBy === 'time' ? 'active' : ''}
              onClick={() => setSortBy('time')}
            >
              ⏱️ Time
            </button>
            <button
              className={sortBy === 'price' ? 'active' : ''}
              onClick={() => setSortBy('price')}
            >
              💷 Price
            </button>
            <button
              className={sortBy === 'score' ? 'active' : ''}
              onClick={() => setSortBy('score')}
            >
              ⭐ Best Value
            </button>
          </div>
        </div>
      </div>
      
      {isCalculating ? (
        <div className="calculating">
          <div className="spinner"></div>
          Calculating commute times...
        </div>
      ) : (
        <div className="hotel-results">
          <div className="results-header">
            Found {filteredAndSortedHotels.length} hotels within {maxCommuteTime} min commute
          </div>
          
          <div className="hotel-list">
            {filteredAndSortedHotels.slice(0, 10).map((item, index) => {
              const priceInfo = hotelPricing.get(item.hotel.id);
              const isAvailable = priceInfo?.available !== false;
              
              return (
                <div
                  key={item.hotel.id}
                  className={`hotel-result ${!isAvailable ? 'unavailable' : ''}`}
                  onClick={() => isAvailable && handleSelectHotel(item)}
                >
                  <div className="hotel-rank">#{index + 1}</div>
                  
                  <div className="hotel-info">
                    <div className="hotel-name">
                      🏨 {item.hotel.name}
                    </div>
                    <div className="hotel-location">
                      {item.hotel.area}
                    </div>
                    
                    <div className="commute-details">
                      <span className="commute-item">
                        🚶 {item.walkingMinutes} min walk to {item.nearestStation?.name}
                      </span>
                      <span className="commute-item">
                        🚇 {item.commuteMinutes} min tube ride
                      </span>
                      <span className="commute-total">
                        ⏱️ Total: {item.totalMinutes} min
                      </span>
                    </div>
                    
                    {item.route && item.route.changes > 0 && (
                      <div className="route-changes">
                        {item.route.changes} line change{item.route.changes > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="hotel-price-column">
                    {priceInfo ? (
                      <>
                        {isAvailable ? (
                          <>
                            <div className="price-amount">
                              £{priceInfo.price}
                            </div>
                            <div className="price-night">per night</div>
                            {priceInfo.roomsLeft && priceInfo.roomsLeft <= 3 && (
                              <div className="rooms-warning">
                                {priceInfo.roomsLeft} left
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="sold-out">Sold Out</div>
                        )}
                      </>
                    ) : (
                      <div className="price-loading">...</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};