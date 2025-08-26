import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HotelCardProps {
  name: string;
  area: string;
  price: number;
  journeyTime?: number;
  walkingTime?: number;
  changes?: number;
  nearestStation?: string;
  isHighlighted?: boolean;
  onSelect?: () => void;
  onShowRoute?: () => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  name,
  area,
  price,
  journeyTime,
  walkingTime,
  changes,
  nearestStation,
  isHighlighted = false,
  onSelect,
  onShowRoute,
}) => {
  return (
    <div 
      className={cn(
        "border rounded-lg p-4 transition-all hover:shadow-lg cursor-pointer",
        isHighlighted ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">{area}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">£{price}</p>
          <p className="text-xs text-muted-foreground">per night</p>
        </div>
      </div>

      {journeyTime && (
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Journey time:</span>
            <span className="font-medium">{journeyTime} min</span>
          </div>
          
          {walkingTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Walking:</span>
              <span>{walkingTime} min</span>
            </div>
          )}
          
          {changes !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Changes:</span>
              <span>{changes === 0 ? 'Direct' : `${changes} ${changes === 1 ? 'change' : 'changes'}`}</span>
            </div>
          )}
          
          {nearestStation && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Station:</span>
              <span>{nearestStation}</span>
            </div>
          )}

          {onShowRoute && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-3"
              onClick={(e) => {
                e.stopPropagation();
                onShowRoute();
              }}
            >
              Show Route
            </Button>
          )}
        </div>
      )}
    </div>
  );
};