import { Station } from '../types/underground';
import { calculateDistance } from '../utils/distance';

interface PostcodeLocation {
  postcode: string;
  lat: number;
  lng: number;
}

/**
 * UK Postcode to coordinates lookup
 * Uses postcodes.io free API
 */
export async function lookupPostcode(postcode: string): Promise<PostcodeLocation | null> {
  try {
    // Clean the postcode (remove spaces, uppercase)
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    // Validate basic UK postcode format
    const postcodeRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/;
    if (!postcodeRegex.test(cleanPostcode)) {
      console.error('Invalid UK postcode format');
      return null;
    }
    
    // Call postcodes.io API
    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
    
    if (!response.ok) {
      console.error('Postcode not found');
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 200 && data.result) {
      return {
        postcode: data.result.postcode,
        lat: data.result.latitude,
        lng: data.result.longitude
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error looking up postcode:', error);
    return null;
  }
}

/**
 * Find nearest tube stations to a location
 */
export function findNearestStations(
  lat: number, 
  lng: number, 
  stations: Station[], 
  maxResults: number = 5,
  maxDistanceMeters: number = 3000 // 3km max
): Array<{ station: Station; distance: number; walkingMinutes: number }> {
  const stationsWithDistance = stations.map(station => {
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    return {
      station,
      distance,
      walkingMinutes: Math.ceil(distance / 80) // 80m per minute walking speed
    };
  });
  
  // Filter by max distance and sort by distance
  return stationsWithDistance
    .filter(s => s.distance <= maxDistanceMeters)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);
}

/**
 * Popular London area postcodes for quick selection
 */
export const popularPostcodes = [
  { area: 'City of London', postcode: 'EC2M 4NS', description: 'Financial District' },
  { area: 'Westminster', postcode: 'SW1A 1AA', description: 'Parliament & Big Ben' },
  { area: 'Canary Wharf', postcode: 'E14 5AB', description: 'Business District' },
  { area: 'King\'s Cross', postcode: 'N1C 4TB', description: 'Tech Hub' },
  { area: 'Shoreditch', postcode: 'EC2A 3AY', description: 'Tech & Creative' },
  { area: 'South Bank', postcode: 'SE1 9PX', description: 'Culture & Arts' },
  { area: 'Paddington', postcode: 'W2 1HB', description: 'Transport Hub' },
  { area: 'Victoria', postcode: 'SW1V 1JU', description: 'Business & Transport' },
  { area: 'London Bridge', postcode: 'SE1 9RA', description: 'Business District' },
  { area: 'Oxford Street', postcode: 'W1D 1BS', description: 'Shopping District' }
];

/**
 * Validate UK postcode format
 */
export function isValidUKPostcode(postcode: string): boolean {
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  const regex = /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/;
  return regex.test(cleaned);
}

/**
 * Format postcode for display
 */
export function formatPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  } else if (cleaned.length === 7) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  return cleaned;
}