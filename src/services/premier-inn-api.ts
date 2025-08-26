/**
 * Premier Inn API Service
 * Since their GraphQL API is protected, we'll use a proxy approach
 * or scrape their website for pricing information
 */

interface PremierInnPrice {
  hotelId: string;
  price?: number;
  currency?: string;
  available: boolean;
  roomsLeft?: number;
  originalPrice?: number;
}

// Cache prices to avoid random changes
const priceCache = new Map<string, PremierInnPrice>();

// London center coordinates (approximately Charing Cross)
const LONDON_CENTER = { lat: 51.5074, lng: -0.1278 };

// Calculate distance from center in km
function distanceFromCenter(lat: number, lng: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat - LONDON_CENTER.lat) * (Math.PI / 180);
  const dLng = (lng - LONDON_CENTER.lng) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(LONDON_CENTER.lat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Fetch pricing from Premier Inn
 * Note: Their API is protected with WAF, so we need to either:
 * 1. Use a backend proxy with proper headers
 * 2. Scrape their website
 * 3. Use their booking widget API if available
 */
export async function fetchPremierInnPricing(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  adults: number = 1,
  children: number = 0,
  hotelLat?: number,
  hotelLng?: number
): Promise<PremierInnPrice> {
  try {
    // Create a cache key based on hotel and dates
    const cacheKey = `${hotelId}_${checkIn}_${checkOut}_${adults}_${children}`;
    
    // Return cached price if available
    if (priceCache.has(cacheKey)) {
      return priceCache.get(cacheKey)!;
    }
    
    // For now, we'll simulate pricing since their API is protected
    // Pricing is based on distance from center of London
    
    // Calculate distance-based pricing if coordinates provided
    let distanceKm = 5; // default middle distance
    if (hotelLat && hotelLng) {
      distanceKm = distanceFromCenter(hotelLat, hotelLng);
    }
    
    // Use semi-random but consistent pricing based on hotel ID and dates
    const hotelSeed = hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const dateSeed = new Date(checkIn).getTime() / 1000000;
    const seed = (hotelSeed + dateSeed) % 100;
    
    // Add some controlled randomness that varies by hotel
    const hotelRandomness = ((hotelSeed * 7) % 100) / 100; // 0-1 unique per hotel
    const randomFactor = 0.7 + hotelRandomness * 0.6; // 0.7 to 1.3 variation
    
    // Base price influenced by multiple factors
    let basePrice: number;
    
    // Start with distance component (40% of price determination)
    let distancePrice: number;
    if (distanceKm < 3) {
      distancePrice = 100 + distanceKm * 10; // Central premium
    } else if (distanceKm < 8) {
      distancePrice = 80 - (distanceKm - 3) * 5; // Gradual decrease
    } else {
      distancePrice = 55 - Math.min(distanceKm - 8, 10) * 2; // Outer areas
    }
    
    // Area desirability factor (30% of price) - based on hotel ID characteristics
    const areaFactor = 0.8 + (hotelSeed % 50) / 100; // 0.8 to 1.3
    
    // Hotel quality/size factor (30% of price) - some hotels are just nicer
    const qualityFactor = 0.9 + hotelRandomness * 0.4; // 0.9 to 1.3
    
    // Combine all factors
    basePrice = distancePrice * areaFactor * qualityFactor * randomFactor;
    
    // Add some true randomness for variety (±15%)
    basePrice = basePrice * (0.85 + Math.random() * 0.3);
    
    // Weekend pricing
    const dayOfWeek = new Date(checkIn).getDay();
    const weekendMultiplier = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.3 : 1;
    
    // Seasonal variation (summer/winter more expensive)
    const month = new Date(checkIn).getMonth();
    const seasonalMultiplier = (month >= 5 && month <= 8) || month === 11 ? 1.2 : 1;
    
    // Calculate final price
    const price = Math.round(basePrice * weekendMultiplier * seasonalMultiplier);
    
    // Availability based on price (more expensive = less available)
    const available = seed > 15 || price < 100; // Higher availability for cheaper hotels
    const roomsLeft = available ? Math.max(1, 5 - Math.floor(price / 50)) : 0;
    
    // Discounts more common for outer hotels
    const hasDiscount = distanceKm > 5 && seed > 60;
    const originalPrice = hasDiscount ? Math.round(price * 1.15) : undefined;
    
    const result = {
      hotelId,
      price: available ? price : undefined,
      currency: 'GBP',
      available,
      roomsLeft: roomsLeft <= 3 ? roomsLeft : undefined,
      originalPrice
    };
    
    // Cache the result
    priceCache.set(cacheKey, result);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return result;
  } catch (error) {
    console.error('Error fetching Premier Inn pricing:', error);
    return {
      hotelId,
      available: false
    };
  }
}

/**
 * Fetch pricing for multiple hotels
 */
export async function fetchMultipleHotelPricing(
  hotels: Array<{ id: string; lat: number; lng: number }>,
  checkIn: string,
  checkOut: string,
  adults: number = 1,
  children: number = 0
): Promise<Map<string, PremierInnPrice>> {
  const prices = new Map<string, PremierInnPrice>();
  
  // In a real implementation, you'd batch these requests
  const promises = hotels.map(async (hotel) => {
    const price = await fetchPremierInnPricing(
      hotel.id, 
      checkIn, 
      checkOut, 
      adults, 
      children,
      hotel.lat,
      hotel.lng
    );
    prices.set(hotel.id, price);
  });
  
  await Promise.all(promises);
  return prices;
}

/**
 * NOTE: To implement real pricing, you would need to:
 * 
 * 1. Backend Proxy Option:
 *    - Create a backend service that makes requests to Premier Inn
 *    - Use proper headers, cookies, and session management
 *    - Handle their WAF/bot detection
 * 
 * 2. Web Scraping Option:
 *    - Use Puppeteer or Playwright
 *    - Navigate to hotel pages programmatically
 *    - Extract pricing from the DOM
 * 
 * 3. Official API Option:
 *    - Contact Premier Inn for API access
 *    - Use their affiliate program if available
 *    - Check if they have a booking widget API
 * 
 * The GraphQL endpoint at https://api.premierinn.com/graphql
 * is protected by Akamai WAF and requires proper authentication.
 */