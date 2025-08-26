# Technical Improvements Roadmap

## Overview
Technical enhancements and architectural improvements planned for the London Underground Hotels application.

## 1. Backend Service Architecture

### GraphQL Backend (Go + gqlgen)
```go
// Proposed schema structure
type Query {
  // Hotel pricing from multiple sources
  hotelPrices(input: HotelSearchInput!): [HotelPrice!]!
  
  // Route planning with hotels
  routeWithHotels(from: String!, to: String!, maxDetour: Int): Route!
  
  // Historical pricing data
  priceHistory(hotelId: String!, days: Int!): [PricePoint!]!
}

type Mutation {
  // User preferences
  saveSearch(input: SavedSearchInput!): SavedSearch!
  
  // Price alerts
  createPriceAlert(input: PriceAlertInput!): PriceAlert!
}

type Subscription {
  // Real-time price updates
  priceUpdates(hotelIds: [String!]!): HotelPrice!
}
```

### Benefits of Backend Service
- Hide API keys and credentials
- Implement caching layer
- Rate limiting and quota management
- Session management for protected APIs
- Data aggregation from multiple sources
- WebSocket support for real-time updates

## 2. Caching Strategy

### Multi-Level Cache Architecture

#### L1: Browser Cache
```typescript
// Service Worker for offline support
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/prices')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          const responseClone = response.clone();
          caches.open('price-cache-v1').then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
  }
});
```

#### L2: Redis Cache (Backend)
```go
// Redis caching for API responses
func getCachedPrice(key string) (*HotelPrice, error) {
  val, err := redisClient.Get(ctx, key).Result()
  if err == redis.Nil {
    return nil, nil
  }
  var price HotelPrice
  json.Unmarshal([]byte(val), &price)
  return &price, nil
}

func setCachedPrice(key string, price *HotelPrice, ttl time.Duration) {
  data, _ := json.Marshal(price)
  redisClient.Set(ctx, key, data, ttl)
}
```

#### L3: Database Cache
- PostgreSQL for historical data
- Time-series data for price trends
- Indexed for fast queries

## 3. Performance Optimizations

### Code Splitting
```typescript
// Lazy load heavy components
const MapOverlay = lazy(() => import('./components/MapOverlay'));
const PriceAnalytics = lazy(() => import('./components/PriceAnalytics'));
```

### Virtual Scrolling for Lists
```typescript
// Use react-window for large hotel lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={hotels.length}
  itemSize={80}
  width='100%'
>
  {HotelRow}
</FixedSizeList>
```

### Web Workers for Heavy Computing
```typescript
// Offload route calculation to Web Worker
const routeWorker = new Worker('/workers/route-calculator.js');

routeWorker.postMessage({
  from: 'Oxford Circus',
  to: 'London Bridge',
  via: selectedHotels
});

routeWorker.onmessage = (e) => {
  const optimizedRoute = e.data;
  updateMap(optimizedRoute);
};
```

## 4. Progressive Web App (PWA)

### Features
- Offline support
- Install to home screen
- Push notifications for price alerts
- Background sync for price updates

### Implementation
```json
// manifest.json
{
  "name": "London Underground Hotels",
  "short_name": "Tube Hotels",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#8B5CF6",
  "background_color": "#1a1a1a",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 5. Real-Time Features

### WebSocket Integration
```typescript
// Real-time price updates
const ws = new WebSocket('wss://api.underground-hotels.com/prices');

ws.onmessage = (event) => {
  const priceUpdate = JSON.parse(event.data);
  updateHotelPrice(priceUpdate.hotelId, priceUpdate.price);
};

// Subscribe to specific hotels
ws.send(JSON.stringify({
  action: 'subscribe',
  hotelIds: visibleHotels
}));
```

### Server-Sent Events Alternative
```typescript
// For simpler one-way updates
const eventSource = new EventSource('/api/price-stream');

eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  handlePriceUpdate(update);
};
```

## 6. Enhanced Map Features

### Clustering for Dense Areas
```typescript
// Cluster nearby hotels at low zoom levels
import MarkerClusterGroup from 'react-leaflet-markercluster';

<MarkerClusterGroup
  spiderfyOnMaxZoom={true}
  showCoverageOnHover={true}
  maxClusterRadius={50}
>
  {hotels.map(hotel => <Marker key={hotel.id} position={hotel.position} />)}
</MarkerClusterGroup>
```

### Heat Maps for Pricing
```typescript
// Show price heat map overlay
import { HeatmapLayer } from 'react-leaflet-heatmap-layer';

<HeatmapLayer
  points={hotels.map(h => ({
    lat: h.lat,
    lng: h.lng,
    intensity: h.price / maxPrice
  }))}
  longitudeExtractor={p => p.lng}
  latitudeExtractor={p => p.lat}
  intensityExtractor={p => p.intensity}
/>
```

## 7. Advanced Route Planning

### Multi-Stop Optimization
```typescript
// TSP algorithm for optimal hotel visits
function optimizeRoute(stations: Station[], hotels: Hotel[]): Route {
  // Implement traveling salesman problem solver
  // Consider:
  // - Walking distance from stations
  // - Total journey time
  // - Hotel check-in times
  // - Price vs convenience trade-offs
}
```

### Time-Based Routing
```typescript
interface TimeRoute {
  departureTime: Date;
  segments: RouteSegment[];
  hotelStops: HotelStop[];
  totalDuration: number;
  totalCost: number;
}

// Consider peak/off-peak times
// Account for hotel check-in times
// Optimize for cost vs time
```

## 8. Analytics & Monitoring

### User Analytics
```typescript
// Track user behavior for improvements
import { Analytics } from '@segment/analytics-next';

const analytics = Analytics({
  writeKey: 'YOUR_WRITE_KEY'
});

// Track searches
analytics.track('Hotel Search', {
  location: 'London',
  checkIn: checkInDate,
  nights: numberOfNights,
  resultsCount: hotels.length
});
```

### Performance Monitoring
```typescript
// Use Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

### Error Tracking
```typescript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

## 9. Testing Infrastructure

### Unit Tests
```typescript
// Component testing with React Testing Library
describe('HotelPriceDisplay', () => {
  it('should show discounted price correctly', () => {
    const { getByText } = render(
      <HotelPriceDisplay 
        price={80} 
        originalPrice={100} 
      />
    );
    expect(getByText('£80')).toBeInTheDocument();
    expect(getByText('Save £20')).toBeInTheDocument();
  });
});
```

### E2E Tests
```typescript
// Playwright for end-to-end testing
test('user can search for hotels', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Check Prices');
  await page.fill('[name=checkIn]', '2024-12-28');
  await page.selectOption('[name=nights]', '2');
  await page.click('text=Search');
  await expect(page.locator('.hotel-price')).toHaveCount(48);
});
```

### Load Testing
```javascript
// k6 load testing script
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '30s',
};

export default function () {
  const res = http.get('https://api.underground-hotels.com/prices');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## 10. Security Enhancements

### API Security
```go
// Rate limiting middleware
func rateLimitMiddleware() gin.HandlerFunc {
  store := ratelimit.NewStore(redis.NewClient(&redis.Options{
    Addr: "localhost:6379",
  }))
  
  return func(c *gin.Context) {
    limiter := ratelimit.NewLimiter(store, &ratelimit.Options{
      Max:        100,
      Period:     time.Hour,
      Identifier: c.ClientIP(),
    })
    
    if !limiter.Allow() {
      c.JSON(429, gin.H{"error": "rate limit exceeded"})
      c.Abort()
      return
    }
    c.Next()
  }
}
```

### Input Validation
```typescript
// Zod schema validation
import { z } from 'zod';

const SearchSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().min(1).max(4),
  children: z.number().min(0).max(4),
});

// Validate before API call
const validatedInput = SearchSchema.parse(userInput);
```

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Go backend with gqlgen
- [ ] Implement basic caching with Redis
- [ ] Add error tracking with Sentry

### Phase 2: Performance (Week 3-4)
- [ ] Implement code splitting
- [ ] Add Service Worker for offline support
- [ ] Set up CDN for static assets

### Phase 3: Features (Week 5-6)
- [ ] WebSocket real-time updates
- [ ] Advanced route planning
- [ ] Price heat maps

### Phase 4: Polish (Week 7-8)
- [ ] PWA features
- [ ] Comprehensive testing
- [ ] Performance monitoring

## Monitoring Dashboard

### Key Metrics
- API response times (p50, p95, p99)
- Cache hit rates
- Error rates by endpoint
- User engagement metrics
- Conversion funnel

### Tools
- Grafana for visualization
- Prometheus for metrics
- ELK stack for logs
- Sentry for errors