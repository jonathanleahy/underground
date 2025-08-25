import { LatLngExpression } from 'leaflet';

/**
 * Calculate control points for a quadratic bezier curve
 * This creates smooth curves between stations
 */
export function calculateBezierControlPoint(
  start: LatLngExpression,
  end: LatLngExpression,
  curveFactor: number = 0.2
): LatLngExpression {
  const startPoint = Array.isArray(start) ? start : [start.lat, start.lng];
  const endPoint = Array.isArray(end) ? end : [end.lat, end.lng];
  
  // Calculate midpoint
  const midLat = (startPoint[0] + endPoint[0]) / 2;
  const midLng = (startPoint[1] + endPoint[1]) / 2;
  
  // Calculate perpendicular offset for curve
  const deltaLat = endPoint[0] - startPoint[0];
  const deltaLng = endPoint[1] - startPoint[1];
  
  // Create control point perpendicular to the line
  const controlLat = midLat - deltaLng * curveFactor;
  const controlLng = midLng + deltaLat * curveFactor;
  
  return [controlLat, controlLng];
}

/**
 * Generate points along a quadratic bezier curve
 */
export function generateBezierPoints(
  start: LatLngExpression,
  control: LatLngExpression,
  end: LatLngExpression,
  segments: number = 20
): LatLngExpression[] {
  const points: LatLngExpression[] = [];
  const startPoint = Array.isArray(start) ? start : [start.lat, start.lng];
  const controlPoint = Array.isArray(control) ? control : [control.lat, control.lng];
  const endPoint = Array.isArray(end) ? end : [end.lat, end.lng];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    
    const lat = mt2 * startPoint[0] + 2 * mt * t * controlPoint[0] + t2 * endPoint[0];
    const lng = mt2 * startPoint[1] + 2 * mt * t * controlPoint[1] + t2 * endPoint[1];
    
    points.push([lat, lng]);
  }
  
  return points;
}

/**
 * Calculate smooth curve for a sequence of stations
 * Uses Catmull-Rom splines for smooth curves through multiple points
 */
export function smoothLinePath(
  stations: LatLngExpression[],
  tension: number = 0.5
): LatLngExpression[] {
  if (stations.length < 2) return stations;
  if (stations.length === 2) {
    // For just two stations, create a simple bezier curve
    const control = calculateBezierControlPoint(stations[0], stations[1], 0.1);
    return generateBezierPoints(stations[0], control, stations[1]);
  }
  
  const smoothPath: LatLngExpression[] = [];
  
  for (let i = 0; i < stations.length - 1; i++) {
    const p0 = i > 0 ? stations[i - 1] : stations[i];
    const p1 = stations[i];
    const p2 = stations[i + 1];
    const p3 = i < stations.length - 2 ? stations[i + 2] : stations[i + 1];
    
    const points = catmullRomSegment(p0, p1, p2, p3, tension);
    smoothPath.push(...points);
  }
  
  return smoothPath;
}

/**
 * Generate points for a Catmull-Rom spline segment
 */
function catmullRomSegment(
  p0: LatLngExpression,
  p1: LatLngExpression,
  p2: LatLngExpression,
  p3: LatLngExpression,
  tension: number = 0.5,
  segments: number = 10
): LatLngExpression[] {
  const points: LatLngExpression[] = [];
  
  const pt0 = Array.isArray(p0) ? p0 : [p0.lat, p0.lng];
  const pt1 = Array.isArray(p1) ? p1 : [p1.lat, p1.lng];
  const pt2 = Array.isArray(p2) ? p2 : [p2.lat, p2.lng];
  const pt3 = Array.isArray(p3) ? p3 : [p3.lat, p3.lng];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const t2 = t * t;
    const t3 = t2 * t;
    
    const v0 = (pt2[0] - pt0[0]) * tension;
    const v1 = (pt3[0] - pt1[0]) * tension;
    
    const lat = pt1[0] * (2 * t3 - 3 * t2 + 1) +
                v0 * (t3 - 2 * t2 + t) +
                pt2[0] * (-2 * t3 + 3 * t2) +
                v1 * (t3 - t2);
    
    const v0lng = (pt2[1] - pt0[1]) * tension;
    const v1lng = (pt3[1] - pt1[1]) * tension;
    
    const lng = pt1[1] * (2 * t3 - 3 * t2 + 1) +
                v0lng * (t3 - 2 * t2 + t) +
                pt2[1] * (-2 * t3 + 3 * t2) +
                v1lng * (t3 - t2);
    
    points.push([lat, lng]);
  }
  
  return points;
}

/**
 * Determine curve parameters based on line type
 * Different lines have different curve characteristics
 */
export function getLineCurveParams(lineId: string): { tension: number; segments: number } {
  const curveParams: Record<string, { tension: number; segments: number }> = {
    'circle': { tension: 0.3, segments: 15 }, // Circle line needs smoother curves
    'central': { tension: 0.4, segments: 12 },
    'northern': { tension: 0.5, segments: 10 },
    'piccadilly': { tension: 0.4, segments: 12 },
    'district': { tension: 0.4, segments: 12 },
    'metropolitan': { tension: 0.5, segments: 10 },
    'victoria': { tension: 0.6, segments: 8 }, // Victoria line is quite straight
    'jubilee': { tension: 0.4, segments: 12 },
    'bakerloo': { tension: 0.5, segments: 10 },
    'hammersmith-city': { tension: 0.3, segments: 15 },
    'waterloo-city': { tension: 0.7, segments: 5 } // Very straight line
  };
  
  return curveParams[lineId] || { tension: 0.5, segments: 10 };
}