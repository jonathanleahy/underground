# Amadeus API Integration for Real Hotel Pricing

## Overview
Integrate Amadeus Self-Service APIs to provide real-time hotel pricing data for the London Underground map application.

## API Details

### Amadeus Self-Service (Free Tier)
- **Website**: https://developers.amadeus.com
- **Free Tier**: 500 API calls/month
- **No credit card required**
- **Instant API key generation**

## Implementation Strategy

### 1. Single API Call for All Hotels
```javascript
// One API call returns up to 100 hotels with prices
amadeus.shopping.hotelOffersSearch.get({
  cityCode: 'LON',
  checkInDate: '2024-12-28',
  checkOutDate: '2024-12-29',
  adults: 2,
  children: 0,
  roomQuantity: 1,
  radius: 50,
  radiusUnit: 'KM',
  hotelName: 'PREMIER INN',  // Filter by chain
  max: 100                   // Get up to 100 results
})
```

### 2. API Call Efficiency
- **1 search = All London hotels** (up to 100)
- **Daily limit**: ~16 calls/day (500/month)
- **Caching strategy**: Store results for 1-2 hours
- **User experience**: Real-time prices with minimal API usage

## Integration Architecture

### Frontend (React)
```typescript
// src/services/amadeusService.ts
interface AmadeusHotelOffer {
  hotel: {
    hotelId: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  offers: [{
    price: {
      total: string;
      currency: string;
    };
    available: boolean;
  }];
}

async function fetchLondonHotelPrices(
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number
): Promise<AmadeusHotelOffer[]>
```

### Backend Options

#### Option 1: Direct Frontend Call (Development)
- Use Amadeus JavaScript SDK directly
- CORS may require proxy setup
- API keys visible (okay for PoC)

#### Option 2: Backend Proxy (Production)
```go
// Go/GraphQL Backend
type Query {
  londonHotelPrices(
    checkIn: String!
    checkOut: String!
    adults: Int!
    children: Int!
  ): [HotelPrice!]!
}

type HotelPrice {
  hotelId: String!
  name: String!
  latitude: Float!
  longitude: Float!
  price: Float!
  currency: String!
  available: Boolean!
}
```

## API Response Mapping

### Amadeus Response → Our Data Structure
```javascript
// Transform Amadeus data to match our hotel format
function mapAmadeusToOurFormat(amadeusData) {
  return {
    id: generateIdFromName(amadeusData.hotel.name),
    name: amadeusData.hotel.name,
    lat: amadeusData.hotel.latitude,
    lng: amadeusData.hotel.longitude,
    price: parseFloat(amadeusData.offers[0].price.total),
    currency: amadeusData.offers[0].price.currency,
    available: amadeusData.offers[0].available
  };
}
```

## Matching Strategy

Since Amadeus won't have our exact hotel IDs:

### Name-Based Matching
1. Search for "PREMIER INN" in London
2. Match by hotel name similarity
3. Use coordinates for verification
4. Cache matched pairs

### Coordinate-Based Matching
```javascript
// Find nearest Amadeus hotel to our Premier Inn location
function findNearestHotel(ourHotel, amadeusHotels) {
  return amadeusHotels.reduce((nearest, hotel) => {
    const distance = calculateDistance(
      ourHotel.lat, ourHotel.lng,
      hotel.latitude, hotel.longitude
    );
    return distance < nearest.distance ? 
      { hotel, distance } : nearest;
  }, { hotel: null, distance: Infinity }).hotel;
}
```

## Caching Strategy

### Redis/In-Memory Cache
```javascript
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

function getCachedPrices(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedPrices(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
```

## Error Handling

### Fallback Strategy
1. **Primary**: Amadeus API
2. **Fallback 1**: Cached data (if < 24 hours old)
3. **Fallback 2**: Simulated prices
4. **User Notice**: "Prices shown are estimates"

## Rate Limiting

### Implementation
```javascript
class RateLimiter {
  constructor(maxCalls = 16, windowMs = 86400000) {
    this.calls = [];
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }
  
  canMakeCall() {
    const now = Date.now();
    this.calls = this.calls.filter(time => 
      now - time < this.windowMs
    );
    return this.calls.length < this.maxCalls;
  }
  
  recordCall() {
    this.calls.push(Date.now());
  }
}
```

## Development Timeline

### Phase 1: Basic Integration (1-2 days)
- [ ] Sign up for Amadeus account
- [ ] Test API with Postman/curl
- [ ] Create basic service module
- [ ] Map one hotel as proof of concept

### Phase 2: Full Integration (2-3 days)
- [ ] Implement hotel matching algorithm
- [ ] Add caching layer
- [ ] Handle all 48 Premier Inn hotels
- [ ] Error handling and fallbacks

### Phase 3: Optimization (1-2 days)
- [ ] Rate limiting
- [ ] Response caching
- [ ] Performance monitoring
- [ ] User feedback for loading states

## Environment Variables

```env
# .env
AMADEUS_CLIENT_ID=your_client_id_here
AMADEUS_CLIENT_SECRET=your_client_secret_here
AMADEUS_ENVIRONMENT=test # or production
CACHE_TTL=3600000
MAX_API_CALLS_PER_DAY=16
```

## Testing Strategy

### Unit Tests
- API response parsing
- Hotel matching algorithm
- Cache functionality
- Rate limiting

### Integration Tests
- Full API flow
- Fallback scenarios
- Error handling
- Performance under load

## Monitoring

### Metrics to Track
- API calls per day
- Cache hit rate
- Average response time
- Error rate
- Hotel match accuracy

## Cost Analysis

### Free Tier (Current)
- **500 calls/month = £0**
- Sufficient for development
- ~16 searches/day

### Growth Projections
| Users/Day | API Calls/Month | Cost |
|-----------|----------------|------|
| 10 | 300 | £0 (free) |
| 50 | 1,500 | ~£5 |
| 200 | 6,000 | ~£20 |
| 1000 | 30,000 | ~£100 |

## Notes

- Amadeus may not have all Premier Inn properties
- Prices might differ from Premier Inn direct
- Consider adding disclaimer: "Prices via Amadeus, may vary"
- For production, implement backend proxy to hide API keys