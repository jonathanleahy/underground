/**
 * Calculate distance between two geographic points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Check if a point is within walking distance of any station in a list
 * Default walking distance is 800m (about 10 minutes walk)
 */
export function isNearAnyStation(
  lat: number,
  lng: number,
  stations: Array<{ lat: number; lng: number }>,
  maxDistance: number = 800 // 800 meters = ~10 min walk
): boolean {
  return stations.some(station => 
    calculateDistance(lat, lng, station.lat, station.lng) <= maxDistance
  );
}

/**
 * Find the nearest station to a point and return the distance
 */
export function findNearestStation(
  lat: number,
  lng: number,
  stations: Array<{ lat: number; lng: number; id?: string; name?: string }>
): { station: typeof stations[0] | null; distance: number } {
  if (stations.length === 0) {
    return { station: null, distance: Infinity };
  }

  let nearest = stations[0];
  let minDistance = calculateDistance(lat, lng, stations[0].lat, stations[0].lng);

  for (let i = 1; i < stations.length; i++) {
    const distance = calculateDistance(lat, lng, stations[i].lat, stations[i].lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = stations[i];
    }
  }

  return { station: nearest, distance: minDistance };
}

/**
 * Convert meters to walking time (assuming 80m/minute walking speed)
 */
export function metersToWalkingMinutes(meters: number): number {
  return Math.round(meters / 80); // Average walking speed: 80m/min
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}