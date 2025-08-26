export interface ConferenceVenue {
  id: string;
  name: string;
  station: string;
  icon: string;
  area: string;
}

export const popularVenues: ConferenceVenue[] = [
  // Major Conference Centers
  {
    id: 'excel',
    name: 'ExCeL London',
    station: 'custom-house-for-excel',
    icon: '🏢',
    area: 'Docklands'
  },
  {
    id: 'olympia',
    name: 'Olympia London',
    station: 'kensington-olympia',
    icon: '🏛️',
    area: 'Kensington'
  },
  {
    id: 'barbican',
    name: 'Barbican Centre',
    station: 'barbican',
    icon: '🎭',
    area: 'City of London'
  },
  {
    id: 'bdc',
    name: 'Business Design Centre',
    station: 'angel',
    icon: '💼',
    area: 'Islington'
  },
  
  // Major Transport Hubs
  {
    id: 'kings-cross',
    name: 'King\'s Cross',
    station: 'kings-cross-st-pancras',
    icon: '🚂',
    area: 'Transport Hub'
  },
  {
    id: 'paddington',
    name: 'Paddington',
    station: 'paddington',
    icon: '🚂',
    area: 'Transport Hub'
  },
  {
    id: 'liverpool-street',
    name: 'Liverpool Street',
    station: 'liverpool-street',
    icon: '🚂',
    area: 'Transport Hub'
  },
  
  // Business Districts
  {
    id: 'canary-wharf',
    name: 'Canary Wharf',
    station: 'canary-wharf',
    icon: '🏙️',
    area: 'Financial District'
  },
  {
    id: 'bank',
    name: 'Bank/City',
    station: 'bank',
    icon: '🏦',
    area: 'Financial District'
  },
  {
    id: 'tcr',
    name: 'Tottenham Court Road',
    station: 'tottenham-court-road',
    icon: '🛍️',
    area: 'West End'
  },
  
  // Airport Connections
  {
    id: 'heathrow',
    name: 'Near Heathrow',
    station: 'heathrow-terminal-2-3',
    icon: '✈️',
    area: 'Airport'
  },
  {
    id: 'victoria',
    name: 'Victoria (Gatwick)',
    station: 'victoria',
    icon: '✈️',
    area: 'Gatwick Connection'
  }
];

export const conferenceAmenities = [
  { id: 'breakfast', label: 'Breakfast Included', icon: '☕' },
  { id: 'workspace', label: 'Work Space', icon: '💻' },
  { id: 'gym', label: 'Gym Access', icon: '🏃' },
  { id: 'late-checkin', label: 'Late Check-in', icon: '🌙' },
  { id: 'meeting-room', label: 'Meeting Rooms', icon: '👥' }
];