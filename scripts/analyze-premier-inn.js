#!/usr/bin/env node

/**
 * Analyze Premier Inn website to find API patterns
 */

import https from 'https';
import http from 'http';

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const module = urlObj.protocol === 'https:' ? https : http;
    
    module.get({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5'
      }
    }, (res) => {
      let data = '';
      
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        console.log(`Redirected to: ${redirectUrl}`);
        fetchPage(redirectUrl).then(resolve).catch(reject);
        return;
      }
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function analyzePremierInn() {
  console.log('🔍 Analyzing Premier Inn website structure...\n');
  
  try {
    // Fetch a hotel page
    const hotelUrl = 'https://www.premierinn.com/gb/en/hotels/england/greater-london/london/london-county-hall.html';
    console.log(`Fetching: ${hotelUrl}`);
    
    const html = await fetchPage(hotelUrl);
    
    // Look for API endpoints in the HTML
    const apiPatterns = [
      /["']([^"']*\/api\/[^"']*)/gi,
      /["']([^"']*graphql[^"']*)/gi,
      /fetch\(["']([^"']*)/gi,
      /axios\.[a-z]+\(["']([^"']*)/gi,
      /["'](https?:\/\/[^"']*premierinn[^"']*\/[^"']*)/gi
    ];
    
    const foundEndpoints = new Set();
    
    for (const pattern of apiPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && !match[1].includes('.css') && !match[1].includes('.png') && !match[1].includes('.jpg')) {
          foundEndpoints.add(match[1]);
        }
      }
    }
    
    console.log('\n📡 Found potential endpoints:');
    [...foundEndpoints].slice(0, 20).forEach(endpoint => {
      console.log(`   ${endpoint}`);
    });
    
    // Look for JavaScript configuration
    const configPattern = /window\.[A-Z_]+\s*=\s*({[^}]+})/g;
    const configMatches = html.matchAll(configPattern);
    
    console.log('\n⚙️ Found configuration objects:');
    for (const match of configMatches) {
      console.log(`   ${match[0].substring(0, 100)}...`);
    }
    
    // Look for data attributes that might contain API info
    const dataApiPattern = /data-[a-z-]*api[a-z-]*="([^"]*)"/gi;
    const dataMatches = html.matchAll(dataApiPattern);
    
    console.log('\n📊 Found data attributes:');
    for (const match of dataMatches) {
      console.log(`   ${match[0]}`);
    }
    
    // Check for React/Next.js props
    const propsPattern = /__NEXT_DATA__.*?({.*?})<\/script>/s;
    const propsMatch = html.match(propsPattern);
    
    if (propsMatch) {
      console.log('\n🎯 Found Next.js data:');
      try {
        const data = JSON.parse(propsMatch[1]);
        if (data.runtimeConfig || data.publicRuntimeConfig) {
          console.log('   Runtime config found!');
          console.log(JSON.stringify(data.runtimeConfig || data.publicRuntimeConfig, null, 2).substring(0, 500));
        }
      } catch (e) {
        console.log('   Could not parse Next.js data');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzePremierInn();