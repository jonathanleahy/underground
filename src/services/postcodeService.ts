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
 * Lookup any destination - postcode, place name, landmark, or address
 */
export async function lookupDestination(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
  const trimmedQuery = query.trim();
  
  // First check if it's a valid UK postcode
  if (isValidUKPostcode(trimmedQuery)) {
    const result = await lookupPostcode(trimmedQuery);
    if (result) {
      return { lat: result.lat, lng: result.lng, name: formatPostcode(trimmedQuery) };
    }
  }
  
  // Check popular London landmarks
  const landmark = popularLandmarks[trimmedQuery.toLowerCase()];
  if (landmark) {
    return landmark;
  }
  
  // Use Nominatim (OpenStreetMap) for general geocoding
  // Add "London" to the query for better results
  const searchQuery = trimmedQuery.includes('London') ? trimmedQuery : `${trimmedQuery}, London, UK`;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `format=json&` +
      `limit=1&` +
      `countrycodes=gb`,
      {
        headers: {
          'User-Agent': 'Premier Inn Hotel Finder'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      // Check if result is in Greater London area
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      // Rough bounds for Greater London
      if (lat >= 51.2 && lat <= 51.8 && lng >= -0.6 && lng <= 0.3) {
        return {
          lat,
          lng,
          name: result.display_name.split(',')[0] // Take first part of address
        };
      }
    }
  } catch (error) {
    console.error('Destination lookup failed:', error);
  }
  
  return null;
}

/**
 * Popular London landmarks and destinations
 */
export const popularLandmarks: { [key: string]: { lat: number; lng: number; name: string } } = {
  'british museum': { lat: 51.5194, lng: -0.1270, name: 'British Museum' },
  'tower of london': { lat: 51.5081, lng: -0.0760, name: 'Tower of London' },
  'tower bridge': { lat: 51.5055, lng: -0.0754, name: 'Tower Bridge' },
  'buckingham palace': { lat: 51.5014, lng: -0.1419, name: 'Buckingham Palace' },
  'westminster abbey': { lat: 51.4993, lng: -0.1273, name: 'Westminster Abbey' },
  'big ben': { lat: 51.5007, lng: -0.1246, name: 'Big Ben' },
  'london eye': { lat: 51.5033, lng: -0.1196, name: 'London Eye' },
  'st pauls cathedral': { lat: 51.5138, lng: -0.0984, name: "St Paul's Cathedral" },
  'st pauls': { lat: 51.5138, lng: -0.0984, name: "St Paul's Cathedral" },
  'tate modern': { lat: 51.5076, lng: -0.0994, name: 'Tate Modern' },
  'natural history museum': { lat: 51.4966, lng: -0.1764, name: 'Natural History Museum' },
  'science museum': { lat: 51.4978, lng: -0.1745, name: 'Science Museum' },
  'v&a museum': { lat: 51.4966, lng: -0.1720, name: 'V&A Museum' },
  'victoria and albert': { lat: 51.4966, lng: -0.1720, name: 'V&A Museum' },
  'excel london': { lat: 51.5082, lng: 0.0310, name: 'ExCeL London' },
  'excel': { lat: 51.5082, lng: 0.0310, name: 'ExCeL London' },
  'o2 arena': { lat: 51.5030, lng: 0.0032, name: 'O2 Arena' },
  'o2': { lat: 51.5030, lng: 0.0032, name: 'O2 Arena' },
  'wembley stadium': { lat: 51.5560, lng: -0.2795, name: 'Wembley Stadium' },
  'wembley': { lat: 51.5560, lng: -0.2795, name: 'Wembley Stadium' },
  'emirates stadium': { lat: 51.5549, lng: -0.1084, name: 'Emirates Stadium' },
  'emirates': { lat: 51.5549, lng: -0.1084, name: 'Emirates Stadium' },
  'stamford bridge': { lat: 51.4817, lng: -0.1910, name: 'Stamford Bridge' },
  'the shard': { lat: 51.5045, lng: -0.0865, name: 'The Shard' },
  'shard': { lat: 51.5045, lng: -0.0865, name: 'The Shard' },
  'covent garden': { lat: 51.5123, lng: -0.1238, name: 'Covent Garden' },
  'camden market': { lat: 51.5414, lng: -0.1465, name: 'Camden Market' },
  'camden': { lat: 51.5414, lng: -0.1465, name: 'Camden Market' },
  'shoreditch': { lat: 51.5264, lng: -0.0778, name: 'Shoreditch' },
  'canary wharf': { lat: 51.5054, lng: -0.0235, name: 'Canary Wharf' },
  'kings cross': { lat: 51.5304, lng: -0.1238, name: 'Kings Cross' },
  'liverpool street': { lat: 51.5178, lng: -0.0823, name: 'Liverpool Street' },
  'victoria station': { lat: 51.4952, lng: -0.1439, name: 'Victoria Station' },
  'victoria': { lat: 51.4952, lng: -0.1439, name: 'Victoria Station' },
  'paddington': { lat: 51.5154, lng: -0.1755, name: 'Paddington Station' },
  'waterloo': { lat: 51.5031, lng: -0.1132, name: 'Waterloo Station' },
  'london bridge': { lat: 51.5050, lng: -0.0867, name: 'London Bridge' },
  'hyde park': { lat: 51.5073, lng: -0.1657, name: 'Hyde Park' },
  'regents park': { lat: 51.5313, lng: -0.1570, name: "Regent's Park" },
  'regent park': { lat: 51.5313, lng: -0.1570, name: "Regent's Park" },
  'greenwich': { lat: 51.4826, lng: -0.0077, name: 'Greenwich' },
  'kew gardens': { lat: 51.4787, lng: -0.2956, name: 'Kew Gardens' },
  'hampstead heath': { lat: 51.5608, lng: -0.1631, name: 'Hampstead Heath' },
  'barbican': { lat: 51.5200, lng: -0.0937, name: 'Barbican Centre' },
  'city of london': { lat: 51.5155, lng: -0.0922, name: 'City of London' },
  'london zoo': { lat: 51.5353, lng: -0.1534, name: 'London Zoo' },
  'madame tussauds': { lat: 51.5229, lng: -0.1545, name: 'Madame Tussauds' }
};

/**
 * Get popular destination suggestions
 */
export function getPopularDestinations() {
  return [
    { name: 'British Museum', query: 'british museum', icon: '🏛️' },
    { name: 'Tower of London', query: 'tower of london', icon: '🏰' },
    { name: 'ExCeL London', query: 'excel london', icon: '📍' },
    { name: 'Canary Wharf', query: 'canary wharf', icon: '🏢' },
    { name: 'Covent Garden', query: 'covent garden', icon: '🎭' },
    { name: 'Kings Cross', query: 'kings cross', icon: '🚂' },
    { name: 'The Shard', query: 'the shard', icon: '🏗️' },
    { name: 'O2 Arena', query: 'o2 arena', icon: '🎪' }
  ];
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