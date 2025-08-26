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
      transform: translate(-50%, -40px);
      border: 2px solid white;
    ">
      ${originalPrice ? `<span style="text-decoration: line-through; opacity: 0.8;">£${originalPrice}</span> ` : ''}
      <span>£${price}</span>
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

  const priceIcon = new DivIcon({
    html: content,
    className: '',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });

  return <Marker position={position} icon={priceIcon} />;
};