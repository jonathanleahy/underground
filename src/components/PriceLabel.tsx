import React from 'react';
import { DivIcon } from 'leaflet';
import { Marker } from 'react-leaflet';

interface PriceLabelProps {
  position: [number, number];
  price?: number;
  available: boolean;
  originalPrice?: number;
}

export const PriceLabel: React.FC<PriceLabelProps> = ({ position, price, available, originalPrice }) => {
  const content = available && price ? 
    `<div style="
      background: ${originalPrice ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #10B981, #059669)'};
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      white-space: nowrap;
      position: relative;
      top: -30px;
      ${originalPrice ? 'text-decoration: line-through;' : ''}
    ">
      £${price}
      ${originalPrice ? `<span style="text-decoration: none; margin-left: 4px;">£${price}</span>` : ''}
    </div>` : 
    `<div style="
      background: linear-gradient(135deg, #6B7280, #4B5563);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      white-space: nowrap;
      position: relative;
      top: -30px;
    ">
      Sold Out
    </div>`;

  const priceIcon = new DivIcon({
    html: content,
    className: 'price-label-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });

  return <Marker position={position} icon={priceIcon} />;
};