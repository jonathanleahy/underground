import React from 'react';
import { cn } from '@/lib/utils';

interface PriceBadgeProps {
  price: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'discount' | 'premium';
  className?: string;
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({ 
  price, 
  size = 'md',
  variant = 'default',
  className 
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const variantStyles = {
    default: 'bg-green-500 text-white',
    discount: 'bg-red-500 text-white',
    premium: 'bg-purple-500 text-white'
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center font-bold rounded-full',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      £{price}
    </span>
  );
};