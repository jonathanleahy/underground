import { Station, Point } from '../types/underground';

// Convert latitude/longitude to screen coordinates
export function latLngToScreen(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number },
  canvasWidth: number,
  canvasHeight: number,
  viewport: { zoom: number; offsetX: number; offsetY: number }
): Point {
  // Normalize coordinates to 0-1 range
  const x = (lng - bounds.west) / (bounds.east - bounds.west);
  const y = 1 - (lat - bounds.south) / (bounds.north - bounds.south); // Flip Y axis

  // Apply zoom and offset
  const scaledX = x * canvasWidth * viewport.zoom + viewport.offsetX;
  const scaledY = y * canvasHeight * viewport.zoom + viewport.offsetY;

  return { x: scaledX, y: scaledY };
}

// Calculate distance between two points
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Find the nearest station to a point
export function findNearestStation(
  point: Point,
  stations: Station[],
  bounds: { north: number; south: number; east: number; west: number },
  canvasWidth: number,
  canvasHeight: number,
  viewport: { zoom: number; offsetX: number; offsetY: number }
): Station | null {
  let nearest: Station | null = null;
  let minDistance = Infinity;

  stations.forEach(station => {
    const stationPoint = latLngToScreen(
      station.lat,
      station.lng,
      bounds,
      canvasWidth,
      canvasHeight,
      viewport
    );
    const dist = distance(point, stationPoint);
    
    if (dist < minDistance && dist < 20) { // 20px threshold
      minDistance = dist;
      nearest = station;
    }
  });

  return nearest;
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}