#!/usr/bin/env node

/**
 * Fetches actual London Underground track geometry from OpenStreetMap
 * This gets the real GPS coordinates of the railway lines, not just stations
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Overpass API query for London Underground track geometry
const OVERPASS_QUERY = `
[out:json][timeout:60];
(
  // Get all London Underground railway tracks
  way["railway"="subway"]["network"="London Underground"](51.2,-0.6,51.8,0.3);
  way["railway"="rail"]["operator"="London Underground"](51.2,-0.6,51.8,0.3);
  way["railway"="rail"]["network"="TfL"](51.2,-0.6,51.8,0.3);
  way["railway"="light_rail"]["network"="London Underground"](51.2,-0.6,51.8,0.3);
  
  // Get by specific line tags
  way["railway"]["line"~"^(Bakerloo|Central|Circle|District|Hammersmith|Jubilee|Metropolitan|Northern|Piccadilly|Victoria|Waterloo)"](51.2,-0.6,51.8,0.3);
  
  // Get tunnel sections
  way["railway"="subway"]["tunnel"="yes"](51.2,-0.6,51.8,0.3);
  
  // Relations for complete routes
  relation["route"="subway"]["network"="London Underground"](51.2,-0.6,51.8,0.3);
);
out body;
>;
out skel qt;
`;

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

async function fetchTrackGeometry() {
  console.log('🚇 Fetching London Underground track geometry from OpenStreetMap...');
  
  try {
    const encodedQuery = encodeURIComponent(OVERPASS_QUERY);
    const response = await httpsPost(
      'overpass-api.de',
      '/api/interpreter',
      `data=${encodedQuery}`
    );

    if (!response.elements) {
      console.log('⚠️  No data from Overpass API');
      return { ways: [], relations: [] };
    }

    console.log(`✅ Found ${response.elements.length} elements`);
    
    // Process ways (track segments)
    const ways = response.elements
      .filter(el => el.type === 'way')
      .map(way => {
        // Get the actual coordinates for this way
        const nodes = way.nodes || [];
        const coordinates = nodes.map(nodeId => {
          const node = response.elements.find(el => el.type === 'node' && el.id === nodeId);
          return node ? [node.lat, node.lon] : null;
        }).filter(coord => coord !== null);
        
        return {
          id: way.id,
          tags: way.tags || {},
          line: way.tags?.line || way.tags?.colour || 'unknown',
          name: way.tags?.name || '',
          coordinates: coordinates
        };
      })
      .filter(way => way.coordinates.length > 0);

    // Process relations (complete routes)
    const relations = response.elements
      .filter(el => el.type === 'relation' && el.tags?.route === 'subway')
      .map(rel => ({
        id: rel.id,
        name: rel.tags?.name || '',
        line: rel.tags?.line || rel.tags?.colour || '',
        color: rel.tags?.colour || '',
        members: rel.members || []
      }));

    return { ways, relations };
  } catch (error) {
    console.error('❌ Overpass API error:', error.message);
    return { ways: [], relations: [] };
  }
}

// Parse line name from tags
function parseLineName(tags) {
  if (tags.line) return tags.line.toLowerCase();
  if (tags.name) {
    const name = tags.name.toLowerCase();
    if (name.includes('bakerloo')) return 'bakerloo';
    if (name.includes('central')) return 'central';
    if (name.includes('circle')) return 'circle';
    if (name.includes('district')) return 'district';
    if (name.includes('hammersmith')) return 'hammersmith-city';
    if (name.includes('jubilee')) return 'jubilee';
    if (name.includes('metropolitan')) return 'metropolitan';
    if (name.includes('northern')) return 'northern';
    if (name.includes('piccadilly')) return 'piccadilly';
    if (name.includes('victoria')) return 'victoria';
    if (name.includes('waterloo')) return 'waterloo-city';
  }
  if (tags.colour) {
    const colorToLine = {
      '#B36305': 'bakerloo',
      '#DC241F': 'central',
      '#FFD300': 'circle',
      '#007D32': 'district',
      '#F589A6': 'hammersmith-city',
      '#A1A5A7': 'jubilee',
      '#9B0058': 'metropolitan',
      '#000000': 'northern',
      '#003688': 'piccadilly',
      '#0098D4': 'victoria',
      '#95CDBA': 'waterloo-city'
    };
    return colorToLine[tags.colour] || 'unknown';
  }
  return 'unknown';
}

// Group track segments by line
function groupTracksByLine(ways) {
  const lineGroups = {};
  
  ways.forEach(way => {
    const lineName = parseLineName(way.tags);
    if (!lineGroups[lineName]) {
      lineGroups[lineName] = [];
    }
    lineGroups[lineName].push(way.coordinates);
  });
  
  return lineGroups;
}

// Merge connected track segments
function mergeConnectedSegments(segments) {
  if (segments.length === 0) return [];
  
  const merged = [];
  let currentPath = [...segments[0]];
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const lastPoint = currentPath[currentPath.length - 1];
    const firstPoint = segment[0];
    
    // Check if segments are connected (within ~50m)
    const distance = Math.sqrt(
      Math.pow(lastPoint[0] - firstPoint[0], 2) + 
      Math.pow(lastPoint[1] - firstPoint[1], 2)
    );
    
    if (distance < 0.0005) { // Approximately 50 meters
      // Connected - merge
      currentPath.push(...segment.slice(1));
    } else {
      // Not connected - start new path
      merged.push(currentPath);
      currentPath = [...segment];
    }
  }
  
  merged.push(currentPath);
  return merged;
}

async function main() {
  console.log('🚀 Starting London Underground Track Geometry Export\n');
  
  // Fetch track geometry
  const { ways, relations } = await fetchTrackGeometry();
  
  console.log(`📊 Processing ${ways.length} track segments...`);
  
  // Group tracks by line
  const tracksByLine = groupTracksByLine(ways);
  
  // Process each line
  const processedLines = {};
  Object.entries(tracksByLine).forEach(([lineName, segments]) => {
    if (lineName === 'unknown') return;
    
    // Merge connected segments
    const mergedPaths = mergeConnectedSegments(segments);
    processedLines[lineName] = mergedPaths;
    
    console.log(`   • ${lineName}: ${mergedPaths.length} paths with ${mergedPaths.reduce((sum, path) => sum + path.length, 0)} points`);
  });
  
  // Calculate statistics
  const stats = {
    totalWays: ways.length,
    totalRelations: relations.length,
    linesFound: Object.keys(processedLines).length,
    totalPoints: Object.values(processedLines).reduce(
      (sum, paths) => sum + paths.reduce((s, path) => s + path.length, 0), 0
    ),
    bounds: {
      north: Math.max(...ways.flatMap(w => w.coordinates.map(c => c[0]))),
      south: Math.min(...ways.flatMap(w => w.coordinates.map(c => c[0]))),
      east: Math.max(...ways.flatMap(w => w.coordinates.map(c => c[1]))),
      west: Math.min(...ways.flatMap(w => w.coordinates.map(c => c[1])))
    }
  };
  
  // Prepare final data
  const data = {
    generated: new Date().toISOString(),
    trackGeometry: processedLines,
    rawWays: ways, // Keep raw data for reference
    relations: relations,
    stats: stats,
    description: 'London Underground actual track GPS geometry from OpenStreetMap'
  };
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'track-geometry.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log('\n📊 Export Summary:');
  console.log(`   • Total track segments: ${stats.totalWays}`);
  console.log(`   • Lines with geometry: ${stats.linesFound}`);
  console.log(`   • Total GPS points: ${stats.totalPoints}`);
  console.log(`   • Bounds: ${stats.bounds.north.toFixed(4)}°N to ${stats.bounds.south.toFixed(4)}°S`);
  console.log(`   • Saved to: ${outputPath}`);
  console.log('\n✅ Export complete!');
}

// Run the exporter
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});