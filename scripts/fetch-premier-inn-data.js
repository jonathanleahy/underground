#!/usr/bin/env node

/**
 * Fetches Premier Inn hotel locations in London
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Premier Inn hotels in London with their coordinates
// This is a curated list of major Premier Inn locations in London
const PREMIER_INN_HOTELS = [
  // Central London
  { id: 'london-county-hall', name: 'London County Hall', lat: 51.5019, lng: -0.1195, area: 'Waterloo', nearestTube: 'Waterloo' },
  { id: 'london-bank-tower', name: 'London Bank (Tower)', lat: 51.5115, lng: -0.0830, area: 'Tower Hill', nearestTube: 'Tower Hill' },
  { id: 'london-city-aldgate', name: 'London City (Aldgate)', lat: 51.5143, lng: -0.0755, area: 'Aldgate', nearestTube: 'Aldgate' },
  { id: 'london-tower-bridge', name: 'London Tower Bridge', lat: 51.5055, lng: -0.0754, area: 'Tower Bridge', nearestTube: 'Tower Hill' },
  { id: 'london-southwark', name: 'London Southwark (Bankside)', lat: 51.5067, lng: -0.0966, area: 'Southwark', nearestTube: 'Southwark' },
  { id: 'london-southwark-tate', name: 'London Southwark (Tate Modern)', lat: 51.5076, lng: -0.0994, area: 'Southwark', nearestTube: 'Southwark' },
  { id: 'london-leicester-square', name: 'London Leicester Square', lat: 51.5113, lng: -0.1281, area: 'Leicester Square', nearestTube: 'Leicester Square' },
  { id: 'london-covent-garden', name: 'Hub London Covent Garden', lat: 51.5117, lng: -0.1246, area: 'Covent Garden', nearestTube: 'Covent Garden' },
  { id: 'london-holborn', name: 'London Holborn', lat: 51.5176, lng: -0.1200, area: 'Holborn', nearestTube: 'Holborn' },
  { id: 'london-euston', name: 'London Euston', lat: 51.5275, lng: -0.1321, area: 'Euston', nearestTube: 'Euston' },
  { id: 'london-st-pancras', name: 'Hub London Kings Cross', lat: 51.5302, lng: -0.1241, area: 'Kings Cross', nearestTube: 'Kings Cross St Pancras' },
  { id: 'london-victoria', name: 'London Victoria', lat: 51.4947, lng: -0.1447, area: 'Victoria', nearestTube: 'Victoria' },
  { id: 'london-paddington', name: 'London Paddington', lat: 51.5154, lng: -0.1755, area: 'Paddington', nearestTube: 'Paddington' },
  
  // West London
  { id: 'london-kensington-olympia', name: 'London Kensington (Olympia)', lat: 51.4983, lng: -0.2104, area: 'Kensington', nearestTube: 'Kensington Olympia' },
  { id: 'london-kensington-earls-court', name: 'London Kensington (Earl\'s Court)', lat: 51.4903, lng: -0.1929, area: 'Earl\'s Court', nearestTube: 'Earl\'s Court' },
  { id: 'london-hammersmith', name: 'London Hammersmith', lat: 51.4927, lng: -0.2239, area: 'Hammersmith', nearestTube: 'Hammersmith' },
  { id: 'london-putney-bridge', name: 'London Putney Bridge', lat: 51.4682, lng: -0.2089, area: 'Putney', nearestTube: 'Putney Bridge' },
  { id: 'london-richmond', name: 'London Richmond', lat: 51.4613, lng: -0.3037, area: 'Richmond', nearestTube: 'Richmond' },
  { id: 'london-ealing', name: 'London Ealing', lat: 51.5133, lng: -0.3040, area: 'Ealing', nearestTube: 'Ealing Broadway' },
  { id: 'london-acton', name: 'London Acton', lat: 51.5025, lng: -0.2680, area: 'Acton', nearestTube: 'Acton Town' },
  { id: 'london-chiswick', name: 'London Chiswick', lat: 51.4918, lng: -0.2558, area: 'Chiswick', nearestTube: 'Turnham Green' },
  
  // North London
  { id: 'london-angel-islington', name: 'London Angel Islington', lat: 51.5344, lng: -0.1059, area: 'Islington', nearestTube: 'Angel' },
  { id: 'london-archway', name: 'London Archway', lat: 51.5653, lng: -0.1353, area: 'Archway', nearestTube: 'Archway' },
  { id: 'london-finchley', name: 'London Finchley', lat: 51.6063, lng: -0.1798, area: 'Finchley', nearestTube: 'Finchley Central' },
  { id: 'london-edgware', name: 'London Edgware', lat: 51.6132, lng: -0.2750, area: 'Edgware', nearestTube: 'Edgware' },
  { id: 'london-barnet', name: 'London Barnet', lat: 51.6525, lng: -0.1986, area: 'Barnet', nearestTube: 'High Barnet' },
  { id: 'london-enfield', name: 'London Enfield', lat: 51.6523, lng: -0.0807, area: 'Enfield', nearestTube: 'Oakwood' },
  { id: 'london-edmonton', name: 'London Edmonton', lat: 51.6215, lng: -0.0707, area: 'Edmonton', nearestTube: 'Tottenham Hale' },
  
  // East London
  { id: 'london-stratford', name: 'London Stratford', lat: 51.5434, lng: -0.0035, area: 'Stratford', nearestTube: 'Stratford' },
  { id: 'london-docklands-excel', name: 'London Docklands (ExCel)', lat: 51.5088, lng: 0.0283, area: 'Docklands', nearestTube: 'Custom House DLR' },
  { id: 'london-greenwich', name: 'London Greenwich', lat: 51.4779, lng: -0.0015, area: 'Greenwich', nearestTube: 'Greenwich DLR' },
  { id: 'london-lewisham', name: 'London Lewisham', lat: 51.4563, lng: -0.0131, area: 'Lewisham', nearestTube: 'Lewisham DLR' },
  { id: 'london-canary-wharf', name: 'London Canary Wharf', lat: 51.5050, lng: -0.0195, area: 'Canary Wharf', nearestTube: 'Canary Wharf' },
  { id: 'london-beckton', name: 'London Beckton', lat: 51.5156, lng: 0.0617, area: 'Beckton', nearestTube: 'Beckton DLR' },
  { id: 'london-ilford', name: 'London Ilford', lat: 51.5591, lng: 0.0698, area: 'Ilford', nearestTube: 'Ilford' },
  
  // South London
  { id: 'london-wimbledon', name: 'London Wimbledon', lat: 51.4214, lng: -0.2064, area: 'Wimbledon', nearestTube: 'Wimbledon' },
  { id: 'london-croydon', name: 'London Croydon', lat: 51.3727, lng: -0.1099, area: 'Croydon', nearestTube: 'East Croydon' },
  { id: 'london-brixton', name: 'London Brixton', lat: 51.4627, lng: -0.1155, area: 'Brixton', nearestTube: 'Brixton' },
  { id: 'london-clapham', name: 'London Clapham', lat: 51.4618, lng: -0.1382, area: 'Clapham', nearestTube: 'Clapham Common' },
  { id: 'london-tooting', name: 'London Tooting', lat: 51.4269, lng: -0.1681, area: 'Tooting', nearestTube: 'Tooting Broadway' },
  
  // Airport Hotels
  { id: 'london-heathrow-t4', name: 'London Heathrow Terminal 4', lat: 51.4580, lng: -0.4458, area: 'Heathrow', nearestTube: 'Heathrow Terminal 4' },
  { id: 'london-heathrow-t5', name: 'London Heathrow Terminal 5', lat: 51.4723, lng: -0.4857, area: 'Heathrow', nearestTube: 'Heathrow Terminal 5' },
  { id: 'london-heathrow-bath-road', name: 'London Heathrow Bath Road', lat: 51.4816, lng: -0.4394, area: 'Heathrow', nearestTube: 'Heathrow Terminals 2-3' },
  
  // Northwest London
  { id: 'london-wembley', name: 'London Wembley', lat: 51.5521, lng: -0.2847, area: 'Wembley', nearestTube: 'Wembley Park' },
  { id: 'london-park-royal', name: 'London Park Royal', lat: 51.5269, lng: -0.2842, area: 'Park Royal', nearestTube: 'Park Royal' },
  { id: 'london-harrow', name: 'London Harrow', lat: 51.5798, lng: -0.3354, area: 'Harrow', nearestTube: 'Harrow-on-the-Hill' },
  { id: 'london-ruislip', name: 'London Ruislip', lat: 51.5737, lng: -0.4213, area: 'Ruislip', nearestTube: 'Ruislip' },
  { id: 'london-uxbridge', name: 'London Uxbridge', lat: 51.5459, lng: -0.4786, area: 'Uxbridge', nearestTube: 'Uxbridge' }
];

async function main() {
  console.log('🚀 Starting Premier Inn Hotels Data Export\n');
  
  // Prepare final data
  const data = {
    generated: new Date().toISOString(),
    hotels: PREMIER_INN_HOTELS,
    stats: {
      total: PREMIER_INN_HOTELS.length,
      bounds: {
        north: Math.max(...PREMIER_INN_HOTELS.map(h => h.lat)),
        south: Math.min(...PREMIER_INN_HOTELS.map(h => h.lat)),
        east: Math.max(...PREMIER_INN_HOTELS.map(h => h.lng)),
        west: Math.min(...PREMIER_INN_HOTELS.map(h => h.lng))
      }
    },
    description: 'Premier Inn hotel locations in London'
  };
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'premier-inn-hotels.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log('\n📊 Export Summary:');
  console.log(`   • Total Hotels: ${data.stats.total}`);
  console.log(`   • Bounds: ${data.stats.bounds.north.toFixed(4)}°N to ${data.stats.bounds.south.toFixed(4)}°S`);
  console.log(`   • Saved to: ${outputPath}`);
  console.log('\n✅ Export complete!');
}

// Run the exporter
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});