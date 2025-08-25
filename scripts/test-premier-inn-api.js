#!/usr/bin/env node

/**
 * Test script to find Premier Inn's real API endpoints
 * Run this to discover their GraphQL or REST endpoints
 */

import https from 'https';

// Potential Premier Inn API endpoints to test
const ENDPOINTS_TO_TEST = [
  {
    url: 'https://www.premierinn.com/api/graphql',
    method: 'POST',
    type: 'GraphQL'
  },
  {
    url: 'https://api.premierinn.com/graphql',
    method: 'POST', 
    type: 'GraphQL'
  },
  {
    url: 'https://www.premierinn.com/graphql',
    method: 'POST',
    type: 'GraphQL'
  },
  {
    url: 'https://www.premierinn.com/api/v1/hotels',
    method: 'GET',
    type: 'REST'
  },
  {
    url: 'https://www.premierinn.com/api/hotels/search',
    method: 'GET',
    type: 'REST'
  },
  {
    url: 'https://booking.premierinn.com/api/availability',
    method: 'GET',
    type: 'REST'
  }
];

// GraphQL introspection query to test GraphQL endpoints
const INTROSPECTION_QUERY = {
  query: `
    query IntrospectionQuery {
      __schema {
        queryType {
          name
        }
      }
    }
  `
};

// Test a simple GraphQL query for hotel data
const HOTEL_QUERY = {
  query: `
    query GetHotels {
      hotels(location: "London") {
        id
        name
        availability {
          price
        }
      }
    }
  `
};

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.url);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: endpoint.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          endpoint: endpoint.url,
          type: endpoint.type,
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500) // First 500 chars
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        endpoint: endpoint.url,
        type: endpoint.type,
        status: 'ERROR',
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        endpoint: endpoint.url,
        type: endpoint.type,
        status: 'TIMEOUT'
      });
    });

    // Send body for POST requests
    if (endpoint.method === 'POST') {
      req.write(JSON.stringify(endpoint.type === 'GraphQL' ? INTROSPECTION_QUERY : {}));
    }

    req.end();
  });
}

async function discoverPremierInnAPI() {
  console.log('🔍 Searching for Premier Inn API endpoints...\n');
  
  // First, let's check what's on their main page
  console.log('📄 Checking main website for clues...');
  
  const websiteReq = https.get('https://www.premierinn.com', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }, (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      // Look for API references in the HTML
      const apiMatches = html.match(/["'](https?:\/\/[^"']*api[^"']*)/gi) || [];
      const graphqlMatches = html.match(/["'](https?:\/\/[^"']*graphql[^"']*)/gi) || [];
      
      if (apiMatches.length > 0) {
        console.log('✅ Found potential API endpoints in HTML:');
        [...new Set(apiMatches)].slice(0, 5).forEach(match => {
          console.log(`   ${match.replace(/["']/g, '')}`);
        });
      }
      
      if (graphqlMatches.length > 0) {
        console.log('✅ Found potential GraphQL endpoints:');
        [...new Set(graphqlMatches)].slice(0, 5).forEach(match => {
          console.log(`   ${match.replace(/["']/g, '')}`);
        });
      }
      
      // Look for JavaScript files that might contain API config
      const jsFiles = html.match(/src=["']([^"']*\.js[^"']*)/gi) || [];
      if (jsFiles.length > 0) {
        console.log('\n📦 JavaScript files that might contain API config:');
        jsFiles.slice(0, 5).forEach(file => {
          console.log(`   ${file.replace(/src=["']/g, '')}`);
        });
      }
    });
  });
  
  websiteReq.on('error', (err) => {
    console.error('❌ Error fetching website:', err.message);
  });
  
  // Test known endpoints
  console.log('\n🧪 Testing potential endpoints...\n');
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);
    
    console.log(`${endpoint.type} Endpoint: ${result.endpoint}`);
    
    if (result.status === 'ERROR') {
      console.log(`   ❌ Error: ${result.error}`);
    } else if (result.status === 'TIMEOUT') {
      console.log(`   ⏱️ Timeout`);
    } else if (result.status === 200 || result.status === 201) {
      console.log(`   ✅ SUCCESS! Status: ${result.status}`);
      console.log(`   Response preview: ${result.data}`);
      
      // If we found a GraphQL endpoint, save it
      if (endpoint.type === 'GraphQL' && result.data.includes('data')) {
        console.log('\n🎉 Found working GraphQL endpoint!');
        return result.endpoint;
      }
    } else {
      console.log(`   ❌ Status: ${result.status}`);
    }
    
    console.log('');
  }
  
  // Try to find their booking system
  console.log('🔍 Checking booking subdomain...');
  const bookingDomains = [
    'https://booking.premierinn.com',
    'https://reservations.premierinn.com',
    'https://book.premierinn.com'
  ];
  
  for (const domain of bookingDomains) {
    try {
      const testUrl = `${domain}/api`;
      const result = await testEndpoint({ url: testUrl, method: 'GET', type: 'REST' });
      if (result.status === 200 || result.status === 401 || result.status === 403) {
        console.log(`✅ Found booking API at ${domain}`);
      }
    } catch (err) {
      // Silent fail
    }
  }
  
  console.log('\n📊 Discovery complete!');
}

// Run the discovery
discoverPremierInnAPI().catch(console.error);