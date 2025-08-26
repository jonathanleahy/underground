import React, { useMemo } from 'react';
import { DivIcon } from 'leaflet';
import { Marker } from 'react-leaflet';

interface PriceLabelProps {
  position: [number, number];
  price?: number;
  available: boolean;
  originalPrice?: number;
  journeyTime?: number;
}

export const PriceLabel: React.FC<PriceLabelProps> = React.memo(({ position, price, available, originalPrice, journeyTime }) => {
  // Adjust position to be above the hotel marker
  const adjustedPosition: [number, number] = [position[0] + 0.0012, position[1]];
  
  const content = available && price ? 
    `<div style="
      background: ${originalPrice ? '#EF4444' : '#10B981'};
      color: white;
      padding: 6px 10px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      white-space: nowrap;
      display: inline-block;
      position: absolute;
      transform: translate(-50%, -10px);
      border: 2px solid white;
    ">
      ${originalPrice ? `<span style="text-decoration: line-through; opacity: 0.8;">£${originalPrice}</span> ` : ''}
      <span>£${price}</span>
      ${journeyTime ? ` <span style="margin-left: 6px; padding-left: 6px; border-left: 1px solid rgba(255,255,255,0.5);">${journeyTime}min</span>` : ''}
    </div>` : 
    `<div style="
      background: #6B7280;
      color: white;
      padding: 5px 8px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      white-space: nowrap;
      display: inline-block;
      position: absolute;
      transform: translate(-50%, -40px);
      border: 2px solid white;
    ">
      Sold Out
    </div>`;

  const priceIcon = useMemo(() => new DivIcon({
    html: content,
    className: 'price-label-icon',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  }), [content]);

  return <Marker position={adjustedPosition} icon={priceIcon} interactive={false} />;
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders during zoom
  return prevProps.price === nextProps.price &&
         prevProps.available === nextProps.available &&
         prevProps.originalPrice === nextProps.originalPrice &&
         prevProps.journeyTime === nextProps.journeyTime &&
         prevProps.position[0] === nextProps.position[0] &&
         prevProps.position[1] === nextProps.position[1];
});