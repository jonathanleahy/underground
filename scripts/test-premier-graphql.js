#!/usr/bin/env node

/**
 * Test Premier Inn's GraphQL API
 */

import https from 'https';

const GRAPHQL_ENDPOINT = 'https://api.premierinn.com/graphql';

async function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query,
      variables
    });

    const options = {
      hostname: 'api.premierinn.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.premierinn.com',
        'Referer': 'https://www.premierinn.com/'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Premier Inn GraphQL API...\n');
  
  // Test 1: Introspection
  console.log('1️⃣ Testing introspection...');
  try {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
            fields {
              name
              description
            }
          }
        }
      }
    `;
    
    const result = await graphqlRequest(introspectionQuery);
    if (result.data) {
      console.log('✅ Introspection successful!');
      console.log('Available queries:');
      result.data.__schema.queryType.fields.slice(0, 10).forEach(field => {
        console.log(`   - ${field.name}: ${field.description || 'No description'}`);
      });
    } else if (result.errors) {
      console.log('❌ Introspection blocked:', result.errors[0].message);
    }
  } catch (error) {
    console.log('❌ Introspection failed:', error.message);
  }
  
  // Test 2: Hotel search
  console.log('\n2️⃣ Testing hotel search...');
  try {
    const searchQuery = `
      query SearchHotels($location: String!, $checkIn: String!, $checkOut: String!) {
        hotelSearch(
          location: $location
          checkInDate: $checkIn
          checkOutDate: $checkOut
        ) {
          hotels {
            id
            name
            address
            coordinates {
              lat
              lng
            }
            availability {
              price
              currency
              roomsAvailable
            }
          }
        }
      }
    `;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    const variables = {
      location: "London",
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfter.toISOString().split('T')[0]
    };
    
    const result = await graphqlRequest(searchQuery, variables);
    if (result.data) {
      console.log('✅ Hotel search successful!');
      console.log(`Found ${result.data.hotelSearch.hotels.length} hotels`);
      result.data.hotelSearch.hotels.slice(0, 3).forEach(hotel => {
        console.log(`   - ${hotel.name}: ${hotel.availability?.price || 'N/A'}`);
      });
    } else if (result.errors) {
      console.log('❌ Hotel search failed:', result.errors[0].message);
    }
  } catch (error) {
    console.log('❌ Hotel search error:', error.message);
  }
  
  // Test 3: Try different query formats
  console.log('\n3️⃣ Testing alternative query formats...');
  
  const queries = [
    {
      name: 'hotels query',
      query: `query { hotels { id name } }`
    },
    {
      name: 'getHotelAvailability',
      query: `query GetAvailability($hotelId: String!) {
        getHotelAvailability(hotelId: $hotelId) {
          price
        }
      }`,
      variables: { hotelId: "london-county-hall" }
    },
    {
      name: 'searchAvailability',
      query: `query SearchAvailability {
        searchAvailability(location: "London") {
          hotels {
            name
            price
          }
        }
      }`
    }
  ];
  
  for (const test of queries) {
    console.log(`\nTrying ${test.name}...`);
    try {
      const result = await graphqlRequest(test.query, test.variables || {});
      if (result.data) {
        console.log('✅ Success:', JSON.stringify(result.data).substring(0, 200));
      } else if (result.errors) {
        console.log('❌ Failed:', result.errors[0].message);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  // Test 4: Check hotel by URL slug
  console.log('\n4️⃣ Testing hotel lookup by URL slug...');
  try {
    const hotelQuery = `
      query GetHotel($slug: String!) {
        hotel(slug: $slug) {
          id
          name
          address
          coordinates {
            lat
            lng
          }
        }
      }
    `;
    
    const result = await graphqlRequest(hotelQuery, { slug: "london-county-hall" });
    if (result.data) {
      console.log('✅ Hotel lookup successful!');
      console.log(JSON.stringify(result.data, null, 2));
    } else if (result.errors) {
      console.log('❌ Hotel lookup failed:', result.errors[0].message);
    }
  } catch (error) {
    console.log('❌ Hotel lookup error:', error.message);
  }
}

testAPI().catch(console.error);