import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Navigation, 
  MapPin, 
  Star, 
  Wifi, 
  Coffee, 
  Car,
  Heart,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HotelListItemProps {
  name: string;
  distance?: string;
  walkingTime?: number;
  price: number;
  originalPrice?: number;
  rating?: number;
  amenities?: string[];
  isSelected?: boolean;
  isFavorite?: boolean;
  availability?: 'available' | 'limited' | 'sold-out';
  onSelect?: () => void;
  onShowRoute?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export const HotelListItem: React.FC<HotelListItemProps> = ({
  name,
  distance = '0.5 miles',
  walkingTime = 8,
  price,
  originalPrice,
  rating,
  amenities = [],
  isSelected = false,
  isFavorite = false,
  availability = 'available',
  onSelect,
  onShowRoute,
  onToggleFavorite,
  className,
}) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all cursor-pointer",
        isSelected 
          ? "border-indigo-500 bg-indigo-50/50 shadow-md" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white",
        className
      )}
      onClick={onSelect}
    >
      {/* Header with name and favorite */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
            {name}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>{distance}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{walkingTime} min walk</span>
            </div>
          </div>
        </div>
        
        {onToggleFavorite && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart 
              className={cn(
                "h-4 w-4",
                isFavorite && "fill-red-500 text-red-500"
              )} 
            />
          </Button>
        )}
      </div>

      {/* Rating and amenities */}
      {(rating || amenities.length > 0) && (
        <div className="flex items-center justify-between mb-3">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
          )}
          {amenities.length > 0 && (
            <div className="flex items-center gap-2">
              {amenities.includes('WiFi') && <Wifi className="h-3 w-3 text-gray-400" />}
              {amenities.includes('Breakfast') && <Coffee className="h-3 w-3 text-gray-400" />}
              {amenities.includes('Parking') && <Car className="h-3 w-3 text-gray-400" />}
            </div>
          )}
        </div>
      )}

      {/* Price section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">£{price}</span>
          {originalPrice && (
            <>
              <span className="text-sm text-gray-500 line-through">£{originalPrice}</span>
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {discount}% OFF
              </Badge>
            </>
          )}
        </div>
        
        {availability === 'limited' && (
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Only 2 left
          </Badge>
        )}
        {availability === 'sold-out' && (
          <Badge variant="outline" className="text-xs">
            Sold out
          </Badge>
        )}
      </div>

      {/* Action button */}
      {onShowRoute && (
        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onShowRoute();
          }}
        >
          <Navigation className="h-3 w-3 mr-1" />
          Show Route
        </Button>
      )}
    </div>
  );
};