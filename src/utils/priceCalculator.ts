import { calculateDistance } from './distance';

// Cache for storing calculated prices
const priceCache = new Map<string, number>();

/**
 * Generate a deterministic "random" number based on a seed string
 * This ensures the same hotel always gets the same "random" variation
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to 0-1 range
  return (Math.abs(hash) % 1000) / 1000;
}

/**
 * Calculate a stable, deterministic price for a hotel based on its location
 * The price will always be the same for the same hotel
 */
export function calculateHotelPrice(
  hotelId: string,
  lat: number,
  lng: number,
  baseDate?: string
): number {
  // Create a cache key including date if provided
  const cacheKey = baseDate ? `${hotelId}-${baseDate}` : hotelId;
  
  // Return cached price if available
  if (priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey)!;
  }
  
  // Calculate distance from central London (Charing Cross)
  const centerLat = 51.5074;
  const centerLng = -0.1278;
  const distanceFromCenter = calculateDistance(lat, lng, centerLat, centerLng);
  const distanceKm = distanceFromCenter / 1000;
  
  // Get deterministic variation based on hotel ID
  const variation = seededRandom(hotelId);
  
  // Base price based on distance zones
  let basePrice: number;
  if (distanceKm < 3) {
    // Zone 1: Central London (most expensive)
    basePrice = 120 + (variation * 60); // £120-180
  } else if (distanceKm < 6) {
    // Zone 2-3: Inner London
    basePrice = 90 + (variation * 40); // £90-130
  } else if (distanceKm < 10) {
    // Zone 4-5: Outer London
    basePrice = 70 + (variation * 30); // £70-100
  } else {
    // Zone 6+: Greater London
    basePrice = 50 + (variation * 30); // £50-80
  }
  
  // Apply day-of-week variation if date provided
  if (baseDate) {
    const date = new Date(baseDate);
    const dayOfWeek = date.getDay();
    
    // Weekend premium (Friday/Saturday)
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      basePrice *= 1.2;
    }
    // Sunday-Thursday discount
    else if (dayOfWeek === 0 || dayOfWeek <= 4) {
      basePrice *= 0.95;
    }
  }
  
  // Round to nearest £5
  const finalPrice = Math.round(basePrice / 5) * 5;
  
  // Cache the price
  priceCache.set(cacheKey, finalPrice);
  
  return finalPrice;
}

/**
 * Clear the price cache (useful when dates change)
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Get cached price if available
 */
export function getCachedPrice(hotelId: string, baseDate?: string): number | null {
  const cacheKey = baseDate ? `${hotelId}-${baseDate}` : hotelId;
  return priceCache.get(cacheKey) || null;
}