#!/usr/bin/env node

/**
 * Fetches London Underground station data from OpenStreetMap via Overpass API
 * and TfL's open data
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TfL line colors (official hex codes)
const LINE_COLORS = {
  'bakerloo': '#B36305',
  'central': '#DC241F',
  'circle': '#FFD300',
  'district': '#007D32',
  'hammersmith-city': '#F589A6',
  'jubilee': '#A1A5A7',
  'metropolitan': '#9B0058',
  'northern': '#000000',
  'piccadilly': '#003688',
  'victoria': '#0098D4',
  'waterloo-city': '#95CDBA',
  'dlr': '#00A4A7',
  'elizabeth': '#7156A5',
  'overground': '#EE7C0E',
  'tram': '#84B817'
};

// Overpass API query for London Underground stations
const OVERPASS_QUERY = `
[out:json][timeout:25];
(
  // Get all London Underground stations
  node["railway"="station"]["network"="London Underground"](51.2,-0.6,51.8,0.3);
  node["railway"="station"]["operator"="London Underground"](51.2,-0.6,51.8,0.3);
  node["railway"="station"]["network"="TfL"](51.2,-0.6,51.8,0.3);
  
  // Get stations by line relations
  node["railway"="station"]["line"~"^(Bakerloo|Central|Circle|District|Hammersmith|Jubilee|Metropolitan|Northern|Piccadilly|Victoria|Waterloo)"](51.2,-0.6,51.8,0.3);
  
  // Get by station=subway tag
  node["station"="subway"](51.2,-0.6,51.8,0.3);
);
out body;
>;
out skel qt;
`;

// TfL API endpoints
const TFL_STOPS_URL = 'https://api.tfl.gov.uk/StopPoint/Mode/tube';
const TFL_LINES_URL = 'https://api.tfl.gov.uk/Line/Mode/tube';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

function httpsPost(hostname, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function fetchFromOverpass() {
  console.log('📍 Fetching station data from OpenStreetMap...');
  
  try {
    const encodedQuery = encodeURIComponent(OVERPASS_QUERY);
    const response = await httpsPost(
      'overpass-api.de',
      '/api/interpreter',
      `data=${encodedQuery}`
    );

    if (!response.elements) {
      console.log('⚠️  No data from Overpass API');
      return [];
    }

    const stations = new Map();
    
    response.elements.forEach(element => {
      if (element.type === 'node' && element.tags && element.tags.name) {
        const id = element.tags.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Skip duplicates
        if (!stations.has(id)) {
          const station = {
            id,
            name: element.tags.name,
            lat: element.lat,
            lng: element.lon,
            lines: [],
            zone: []
          };

          // Extract line information from tags
          if (element.tags.line) {
            station.lines = element.tags.line.split(';').map(l => l.trim().toLowerCase());
          }
          
          // Extract zone information
          if (element.tags.zone) {
            station.zone = element.tags.zone.split(';').map(z => parseInt(z));
          }

          stations.set(id, station);
        }
      }
    });

    console.log(`✅ Found ${stations.size} stations from OpenStreetMap`);
    return Array.from(stations.values());
  } catch (error) {
    console.error('❌ Overpass API error:', error.message);
    return [];
  }
}

async function fetchFromTfL() {
  console.log('🚇 Fetching additional data from TfL API...');
  
  try {
    const stopsData = await httpsGet(TFL_STOPS_URL);
    
    if (!Array.isArray(stopsData)) {
      console.log('⚠️  Invalid response from TfL API');
      return [];
    }

    const stations = stopsData
      .filter(stop => stop.stopType === 'NaptanMetroStation')
      .map(stop => ({
        id: stop.id.toLowerCase(),
        name: stop.commonName.replace(' Underground Station', ''),
        lat: stop.lat,
        lng: stop.lon,
        lines: (stop.lines || []).map(l => l.id),
        zone: stop.zone ? stop.zone.split('+').map(z => parseInt(z)) : []
      }));

    console.log(`✅ Found ${stations.length} stations from TfL`);
    return stations;
  } catch (error) {
    console.error('❌ TfL API error:', error.message);
    return [];
  }
}

async function fetchLineData() {
  console.log('🎨 Fetching line information...');
  
  try {
    const linesData = await httpsGet(TFL_LINES_URL);
    
    if (!Array.isArray(linesData)) {
      return [];
    }

    return linesData.map(line => ({
      id: line.id,
      name: line.name,
      color: LINE_COLORS[line.id] || '#666666',
      stations: [] // Will be populated from station data
    }));
  } catch (error) {
    console.error('❌ Error fetching line data:', error.message);
    return [];
  }
}

function mergeStationData(overpassStations, tflStations) {
  const merged = new Map();
  
  // Add Overpass stations
  overpassStations.forEach(station => {
    merged.set(station.id, station);
  });
  
  // Merge or add TfL stations
  tflStations.forEach(tflStation => {
    const existing = Array.from(merged.values()).find(
      s => Math.abs(s.lat - tflStation.lat) < 0.001 && 
           Math.abs(s.lng - tflStation.lng) < 0.001
    );
    
    if (existing) {
      // Merge line information
      const lines = new Set([...existing.lines, ...tflStation.lines]);
      existing.lines = Array.from(lines);
      
      // Merge zone information
      if (tflStation.zone.length > 0 && existing.zone.length === 0) {
        existing.zone = tflStation.zone;
      }
    } else {
      merged.set(tflStation.id, tflStation);
    }
  });
  
  return Array.from(merged.values());
}

async function main() {
  console.log('🚀 Starting London Underground Data Export\n');
  
  // Fetch data from multiple sources
  const [overpassStations, tflStations, lines] = await Promise.all([
    fetchFromOverpass(),
    fetchFromTfL(),
    fetchLineData()
  ]);
  
  // Merge station data
  const stations = mergeStationData(overpassStations, tflStations);
  
  // Sort stations by name
  stations.sort((a, b) => a.name.localeCompare(b.name));
  
  // Create line-station associations
  lines.forEach(line => {
    line.stations = stations
      .filter(station => station.lines.includes(line.id))
      .map(station => station.id);
  });
  
  // Prepare final data
  const data = {
    generated: new Date().toISOString(),
    stations: stations,
    lines: lines,
    lineColors: LINE_COLORS,
    bounds: {
      north: Math.max(...stations.map(s => s.lat)),
      south: Math.min(...stations.map(s => s.lat)),
      east: Math.max(...stations.map(s => s.lng)),
      west: Math.min(...stations.map(s => s.lng))
    }
  };
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'underground-data.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log('\n📊 Export Summary:');
  console.log(`   • Stations: ${stations.length}`);
  console.log(`   • Lines: ${lines.length}`);
  console.log(`   • Bounds: ${data.bounds.north.toFixed(4)}°N to ${data.bounds.south.toFixed(4)}°S`);
  console.log(`   • Saved to: ${outputPath}`);
  console.log('\n✅ Export complete!');
}

// Run the exporter
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});