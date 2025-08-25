export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: string[];
  zone: number[];
}

export interface Line {
  id: string;
  name: string;
  color: string;
  stations: string[];
}

export interface MapViewport {
  centerLat: number;
  centerLng: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface UndergroundData {
  generated: string;
  stations: Station[];
  lines: Line[];
  lineColors: Record<string, string>;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}