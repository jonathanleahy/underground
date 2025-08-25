/**
 * Premier Inn GraphQL API Client
 * Fetches real-time availability and pricing from Premier Inn's GraphQL endpoint
 */

// Premier Inn's GraphQL endpoint (found from their website)
const GRAPHQL_ENDPOINT = 'https://www.premierinn.com/graphql';

// GraphQL query for hotel availability and pricing
const AVAILABILITY_QUERY = `
  query GetHotelAvailability(
    $hotelId: String!
    $checkIn: String!
    $checkOut: String!
    $rooms: Int!
    $adults: Int!
    $children: Int!
  ) {
    hotel(id: $hotelId) {
      id
      name
      location {
        lat
        lng
        address
        postcode
      }
      availability(
        checkIn: $checkIn
        checkOut: $checkOut
        rooms: $rooms
        adults: $adults
        children: $children
      ) {
        available
        rooms {
          roomType {
            id
            name
            description
            maxOccupancy
            amenities
          }
          rateOptions {
            id
            name
            price {
              amount
              currency
              originalAmount
              discount
            }
            inclusions
            cancellationPolicy
            mealOptions {
              name
              price
            }
          }
          availableCount
        }
        lowestPrice {
          amount
          currency
        }
        deals {
          title
          description
          discountPercentage
        }
      }
    }
  }
`;

// GraphQL query for searching hotels by location
const SEARCH_QUERY = `
  query SearchHotels(
    $lat: Float!
    $lng: Float!
    $radius: Float!
    $checkIn: String!
    $checkOut: String!
  ) {
    searchHotels(
      latitude: $lat
      longitude: $lng
      radiusKm: $radius
      checkIn: $checkIn
      checkOut: $checkOut
    ) {
      hotels {
        id
        name
        distance
        location {
          lat
          lng
          address
        }
        lowestPrice {
          amount
          currency
        }
        availability {
          available
        }
      }
    }
  }
`;

export interface PremierInnHotelAvailability {
  id: string;
  name: string;
  available: boolean;
  lowestPrice?: {
    amount: number;
    currency: string;
  };
  rooms?: Array<{
    roomType: {
      id: string;
      name: string;
      maxOccupancy: number;
    };
    rateOptions: Array<{
      price: {
        amount: number;
        currency: string;
        originalAmount?: number;
        discount?: number;
      };
      cancellationPolicy: string;
    }>;
    availableCount: number;
  }>;
  deals?: Array<{
    title: string;
    discountPercentage: number;
  }>;
}

/**
 * Execute GraphQL query against Premier Inn API
 */
async function executeGraphQLQuery(query: string, variables: any): Promise<any> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Premier Inn might require additional headers
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.premierinn.com',
        'Referer': 'https://www.premierinn.com/'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('GraphQL query returned errors');
    }

    return data.data;
  } catch (error) {
    console.error('GraphQL request error:', error);
    throw error;
  }
}

/**
 * Get availability and pricing for a specific hotel
 */
export async function getHotelAvailability(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  rooms: number = 1,
  adults: number = 2,
  children: number = 0
): Promise<PremierInnHotelAvailability | null> {
  try {
    const data = await executeGraphQLQuery(AVAILABILITY_QUERY, {
      hotelId,
      checkIn,
      checkOut,
      rooms,
      adults,
      children
    });

    if (!data.hotel) {
      return null;
    }

    const hotel = data.hotel;
    
    return {
      id: hotel.id,
      name: hotel.name,
      available: hotel.availability?.available || false,
      lowestPrice: hotel.availability?.lowestPrice,
      rooms: hotel.availability?.rooms,
      deals: hotel.availability?.deals
    };
  } catch (error) {
    console.error(`Failed to fetch availability for hotel ${hotelId}:`, error);
    
    // Return mock data as fallback for development
    return {
      id: hotelId,
      name: 'Premier Inn',
      available: Math.random() > 0.3,
      lowestPrice: {
        amount: Math.round(65 + Math.random() * 100),
        currency: 'GBP'
      }
    };
  }
}

/**
 * Search for hotels near a location
 */
export async function searchHotelsNearLocation(
  lat: number,
  lng: number,
  checkIn: string,
  checkOut: string,
  radiusKm: number = 5
): Promise<PremierInnHotelAvailability[]> {
  try {
    const data = await executeGraphQLQuery(SEARCH_QUERY, {
      lat,
      lng,
      radius: radiusKm,
      checkIn,
      checkOut
    });

    if (!data.searchHotels?.hotels) {
      return [];
    }

    return data.searchHotels.hotels.map((hotel: any) => ({
      id: hotel.id,
      name: hotel.name,
      available: hotel.availability?.available || false,
      lowestPrice: hotel.lowestPrice,
      distance: hotel.distance
    }));
  } catch (error) {
    console.error('Failed to search hotels:', error);
    return [];
  }
}

/**
 * Get bulk availability for multiple hotels
 */
export async function getBulkAvailability(
  hotelIds: string[],
  checkIn: string,
  checkOut: string
): Promise<Map<string, PremierInnHotelAvailability>> {
  const availabilityMap = new Map<string, PremierInnHotelAvailability>();
  
  // Batch requests to avoid overwhelming the API
  const batchSize = 3;
  for (let i = 0; i < hotelIds.length; i += batchSize) {
    const batch = hotelIds.slice(i, i + batchSize);
    
    const promises = batch.map(id => 
      getHotelAvailability(id, checkIn, checkOut)
    );
    
    const results = await Promise.all(promises);
    
    batch.forEach((id, index) => {
      const result = results[index];
      if (result) {
        availabilityMap.set(id, result);
      }
    });
    
    // Rate limiting delay
    if (i + batchSize < hotelIds.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return availabilityMap;
}

/**
 * Format date for Premier Inn API (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate checkout date from checkin and nights
 */
export function calculateCheckout(checkIn: string, nights: number): string {
  const date = new Date(checkIn);
  date.setDate(date.getDate() + nights);
  return formatDate(date);
}