import React from 'react';
import { cn } from '@/lib/utils';

interface SimplePriceLabelProps {
  price?: number;
  available?: boolean;
  originalPrice?: number;
  journeyTime?: number;
  className?: string;
}

export const SimplePriceLabel: React.FC<SimplePriceLabelProps> = ({
  price,
  available = true,
  originalPrice,
  journeyTime,
  className
}) => {
  if (!available) {
    return (
      <div className={cn(
        "inline-flex items-center px-3 py-1.5 bg-gray-500 text-white rounded-full text-xs font-semibold shadow-md border-2 border-white",
        className
      )}>
        Sold Out
      </div>
    );
  }

  if (!price) return null;

  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <div className={cn(
      "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-md border-2 border-white",
      hasDiscount ? "bg-red-500 text-white" : "bg-green-500 text-white",
      className
    )}>
      {hasDiscount && (
        <span className="line-through opacity-80 mr-1">
          £{originalPrice}
        </span>
      )}
      <span>£{price}</span>
      {journeyTime && (
        <span className="ml-2 pl-2 border-l border-white/50">
          {journeyTime}min
        </span>
      )}
    </div>
  );
};