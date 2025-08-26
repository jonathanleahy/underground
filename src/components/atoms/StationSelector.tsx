import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ChevronRight, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StationSelectorProps {
  station?: string;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  isPopular?: boolean;
  journeyTime?: number;
  className?: string;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  station = 'Select a station',
  onClick,
  variant = 'default',
  isPopular = false,
  journeyTime,
  className,
}) => {
  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("justify-start", className)}
        onClick={onClick}
      >
        <MapPin className="h-3 w-3 mr-1" />
        {station}
      </Button>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={cn(
          "p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <MapPin className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{station}</span>
                {isPopular && (
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              {journeyTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{journeyTime} min away</span>
                </div>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <Button
      className={cn("w-full justify-between", className)}
      variant="outline"
      onClick={onClick}
    >
      <span className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {station}
      </span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
};