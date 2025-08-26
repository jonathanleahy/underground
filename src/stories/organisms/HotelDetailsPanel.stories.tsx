import type { Meta, StoryObj } from '@storybook/react';
import { HotelDetailsPanel } from '@/components/HotelDetailsPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { 
  Hotel, 
  MapPin, 
  Train,
  Clock,
  Wallet,
  TrendingUp,
  AlertCircle,
  Calendar,
  Users,
  Wifi,
  Coffee,
  Car,
  ArrowRight,
  Star,
  Navigation,
  Building
} from 'lucide-react';

// Modern Hotel Details Panel Component
const ModernHotelDetailsPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'journey' | 'amenities' | 'pricing'>('journey');

  const hotel = {
    hotel: {
      id: 'london-victoria',
      name: 'Premier Inn London Victoria',
      area: 'Westminster, Central London'
    },
    workplaceStation: { name: 'Victoria Station' },
    hotelStation: { name: 'Victoria Station' },
    workplaceWalkTime: 5,
    hotelWalkTime: 3,
    tubeTime: 0,
    lineChanges: 0,
    totalTime: 8,
    price: 89,
    totalCost: 267,
    roomsLeft: 2,
    available: true,
    amenities: ['Free WiFi', 'Breakfast Available', 'Bar', 'Restaurant', '24h Reception'],
    rating: 4.5,
    reviews: 1234
  };

  const nights = 3;

  if (!isOpen) {
    return (
      <div className="max-w-md mx-auto">
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Hotel className="h-4 w-4 mr-2" />
          Show Hotel Details
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="shadow-2xl border-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                  <Hotel className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{hotel.hotel.name}</h2>
                  <p className="text-indigo-100 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {hotel.hotel.area}
                  </p>
                </div>
              </div>
              
              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{hotel.rating}</span>
                  <span className="text-indigo-100">({hotel.reviews} reviews)</span>
                </div>
                {hotel.roomsLeft && hotel.roomsLeft <= 3 && (
                  <Badge className="bg-red-500 text-white border-0">
                    🔥 Only {hotel.roomsLeft} rooms left!
                  </Badge>
                )}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            {[
              { id: 'journey' as const, label: 'Journey', icon: Navigation },
              { id: 'amenities' as const, label: 'Amenities', icon: Coffee },
              { id: 'pricing' as const, label: 'Pricing', icon: Wallet }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-6">
          {/* Journey Tab */}
          {selectedTab === 'journey' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-indigo-600" />
                  Your Journey
                </h3>
                
                <div className="space-y-4">
                  {/* From Workplace */}
                  <div className="flex items-start gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="w-0.5 h-12 bg-gray-300 mt-2" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">From Workplace</div>
                      <div className="text-sm text-gray-600">
                        {hotel.workplaceWalkTime} min walk to {hotel.workplaceStation.name}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {hotel.workplaceWalkTime} min
                    </Badge>
                  </div>

                  {/* Tube Journey */}
                  <div className="flex items-start gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Train className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="w-0.5 h-12 bg-gray-300 mt-2" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Tube Journey</div>
                      <div className="text-sm text-gray-600">
                        {hotel.tubeTime > 0 ? (
                          <>
                            {hotel.tubeTime} min journey
                            {hotel.lineChanges > 0 && ` (${hotel.lineChanges} change${hotel.lineChanges > 1 ? 's' : ''})`}
                          </>
                        ) : (
                          'Direct connection - same station'
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {hotel.tubeTime} min
                    </Badge>
                  </div>

                  {/* To Hotel */}
                  <div className="flex items-start gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Hotel className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">To Hotel</div>
                      <div className="text-sm text-gray-600">
                        {hotel.hotelWalkTime} min walk from {hotel.hotelStation.name}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {hotel.hotelWalkTime} min
                    </Badge>
                  </div>
                </div>

                {/* Total Journey Summary */}
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-900">Total Journey Time</span>
                    <span className="text-2xl font-bold text-indigo-600">{hotel.totalTime} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amenities Tab */}
          {selectedTab === 'amenities' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-indigo-600" />
                  Hotel Amenities
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {hotel.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      {amenity.includes('WiFi') && <Wifi className="h-4 w-4 text-gray-600" />}
                      {amenity.includes('Breakfast') && <Coffee className="h-4 w-4 text-gray-600" />}
                      {amenity.includes('Parking') && <Car className="h-4 w-4 text-gray-600" />}
                      {!amenity.includes('WiFi') && !amenity.includes('Breakfast') && !amenity.includes('Parking') && 
                        <AlertCircle className="h-4 w-4 text-gray-600" />}
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Check-in time</span>
                    <span className="font-medium">From 2:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Check-out time</span>
                    <span className="font-medium">Until 12:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reception</span>
                    <span className="font-medium">24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {selectedTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-indigo-600" />
                  Pricing Details
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <span className="text-3xl font-bold">£{hotel.price}</span>
                        <span className="text-gray-600 ml-2">per night</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Best Price
                      </Badge>
                    </div>
                  </div>

                  {nights > 1 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Room rate</span>
                          <span>£{hotel.price} × {nights} nights</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span>£{hotel.price * nights}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total for {nights} nights</span>
                          <span className="text-lg">£{hotel.totalCost}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium">Flexible Booking</p>
                        <p className="text-xs mt-1">Free cancellation up to 1 day before check-in</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer with Book Now Button */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Tomorrow</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">2 Adults</span>
              </div>
            </div>
            
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]"
              disabled={!hotel.available}
            >
              {hotel.available ? (
                <>
                  Book Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                'Sold Out'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const meta: Meta<typeof HotelDetailsPanel> = {
  tags: ["autodocs"],
  title: 'Organisms/HotelDetailsPanel',
  component: HotelDetailsPanel,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component for original HotelDetailsPanel with modern styling
const StyledHotelDetailsPanel: React.FC<any> = (props) => {
  const [isOpen, setIsOpen] = useState(props.isOpen ?? true);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Hotel className="h-6 w-6" />
                {props.hotel.hotel.name}
              </h2>
              <p className="text-indigo-100 mt-1">{props.hotel.hotel.area}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Journey Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Journey</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">From Workplace</div>
                    <div className="text-sm text-gray-600">
                      {props.hotel.workplaceWalkTime} min walk to {props.hotel.workplaceStation.name}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
                  <Train className="h-5 w-5 text-indigo-600" />
                  <div className="flex-1">
                    <div className="font-medium">Tube Journey</div>
                    <div className="text-sm text-gray-600">
                      {props.hotel.tubeTime > 0 ? (
                        <>
                          {props.hotel.tubeTime} min journey
                          {props.hotel.lineChanges > 0 && ` (${props.hotel.lineChanges} change${props.hotel.lineChanges > 1 ? 's' : ''})`}
                        </>
                      ) : (
                        'Direct connection - same station'
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <Hotel className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium">To Hotel</div>
                    <div className="text-sm text-gray-600">
                      {props.hotel.hotelWalkTime} min walk from {props.hotel.hotelStation.name}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Journey Time</span>
                  <span className="text-2xl font-bold text-indigo-600">{props.hotel.totalTime} min</span>
                </div>
              </div>
            </div>
            
            {/* Pricing */}
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold">£{props.hotel.price}</span>
                  <span className="text-gray-600 ml-2">per night</span>
                </div>
                {props.hotel.roomsLeft !== undefined && props.hotel.roomsLeft <= 3 && props.hotel.roomsLeft > 0 && (
                  <Badge className="bg-red-500 text-white">
                    Only {props.hotel.roomsLeft} rooms left!
                  </Badge>
                )}
                {props.hotel.roomsLeft === 0 && (
                  <Badge variant="destructive">
                    Fully Booked
                  </Badge>
                )}
              </div>
              
              {props.nights > 1 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total for {props.nights} nights</span>
                    <span className="font-semibold">£{props.hotel.totalCost}</span>
                  </div>
                </div>
              )}
              
              <Button
                className={`w-full ${props.hotel.available ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'}`}
                disabled={!props.hotel.available}
                onClick={() => console.log('Book now')}
              >
                {props.hotel.available ? (
                  <>
                    Book on Premier Inn
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Sold Out'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <StyledHotelDetailsPanel
      hotel={{
        hotel: {
          id: 'london-victoria',
          name: 'Premier Inn London Victoria',
          area: 'Westminster, Central London'
        },
        workplaceStation: { name: 'Oxford Circus' },
        hotelStation: { name: 'Victoria Station' },
        workplaceWalkTime: 5,
        hotelWalkTime: 3,
        tubeTime: 12,
        lineChanges: 1,
        totalTime: 20,
        price: 89,
        totalCost: 267,
        roomsLeft: 2,
        available: true
      }}
      nights={3}
      checkInDate="2024-12-25"
    />
  ),
};

export const Modern: Story = {
  render: () => <ModernHotelDetailsPanel />,
};

export const SoldOut: Story = {
  render: () => (
    <StyledHotelDetailsPanel
      hotel={{
        hotel: {
          id: 'london-waterloo',
          name: 'Premier Inn London Waterloo',
          area: 'South Bank, London'
        },
        workplaceStation: { name: 'Bank' },
        hotelStation: { name: 'Waterloo' },
        workplaceWalkTime: 3,
        hotelWalkTime: 5,
        tubeTime: 8,
        lineChanges: 0,
        totalTime: 16,
        price: 95,
        totalCost: 285,
        roomsLeft: 0,
        available: false
      }}
      nights={3}
      checkInDate="2024-12-25"
    />
  ),
};

export const DirectConnection: Story = {
  render: () => (
    <StyledHotelDetailsPanel
      hotel={{
        hotel: {
          id: 'london-kings-cross',
          name: 'Premier Inn London Kings Cross',
          area: 'Kings Cross, Central London'
        },
        workplaceStation: { name: 'Kings Cross St. Pancras' },
        hotelStation: { name: 'Kings Cross St. Pancras' },
        workplaceWalkTime: 2,
        hotelWalkTime: 1,
        tubeTime: 0,
        lineChanges: 0,
        totalTime: 3,
        price: 125,
        totalCost: 375,
        available: true
      }}
      nights={3}
      checkInDate="2024-12-25"
    />
  ),
};