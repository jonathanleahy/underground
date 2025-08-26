import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  Train, 
  Star, 
  Wifi, 
  Car,
  Coffee,
  Users,
  Heart,
  Share2,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernHotelCardProps {
  name: string;
  area: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image?: string;
  journeyTime: number;
  walkingTime: number;
  changes: number;
  nearestStation: string;
  amenities?: string[];
  isFavorite?: boolean;
  isPopular?: boolean;
  discount?: number;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onShowRoute?: () => void;
}

export const ModernHotelCard: React.FC<ModernHotelCardProps> = ({
  name,
  area,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  journeyTime,
  walkingTime,
  changes,
  nearestStation,
  amenities = ['WiFi', 'Parking', 'Breakfast'],
  isFavorite = false,
  isPopular = false,
  discount,
  onSelect,
  onToggleFavorite,
  onShare,
  onShowRoute,
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-2xl cursor-pointer border-0 bg-white">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-600 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPin className="h-16 w-16 text-white/30" />
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isPopular && (
            <Badge className="bg-orange-500 border-0 text-white shadow-lg">
              🔥 Popular
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-red-500 border-0 text-white shadow-lg">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full h-8 w-8 p-0 bg-white/90 backdrop-blur hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full h-8 w-8 p-0 bg-white/90 backdrop-blur hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">£{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">£{originalPrice}</span>
              )}
            </div>
            <p className="text-xs text-gray-600">per night</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title and Rating */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-600">{area}</p>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">{rating}</span>
              <span className="text-xs text-gray-500">({reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Journey Info Grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{journeyTime} min</p>
            <p className="text-xs text-gray-500">Journey</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{walkingTime} min</p>
            <p className="text-xs text-gray-500">Walk</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Train className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {changes === 0 ? 'Direct' : `${changes}`}
            </p>
            <p className="text-xs text-gray-500">
              {changes === 0 ? 'Route' : 'Changes'}
            </p>
          </div>
        </div>

        {/* Station Info */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Train className="h-4 w-4 text-indigo-600" />
            <span className="text-sm text-gray-700">{nearestStation}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex gap-4 mt-3">
          {amenities.includes('WiFi') && (
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">WiFi</span>
            </div>
          )}
          {amenities.includes('Parking') && (
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">Parking</span>
            </div>
          )}
          {amenities.includes('Breakfast') && (
            <div className="flex items-center gap-1">
              <Coffee className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">Breakfast</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          View Details
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          onClick={(e) => {
            e.stopPropagation();
            onShowRoute?.();
          }}
        >
          Show Route
        </Button>
      </CardFooter>
    </Card>
  );
};