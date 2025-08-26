import React, { useState, useEffect } from 'react';
import './PriceFilter.css';

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  onFilterChange: (min: number, max: number) => void;
  hotelCount: number;
  filteredCount: number;
}

export const PriceFilter: React.FC<PriceFilterProps> = ({
  minPrice,
  maxPrice,
  onFilterChange,
  hotelCount,
  filteredCount
}) => {
  const [range, setRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  
  useEffect(() => {
    setRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);
  
  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, range[1] - 10);
    setRange([newMin, range[1]]);
    onFilterChange(newMin, range[1]);
  };
  
  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, range[0] + 10);
    setRange([range[0], newMax]);
    onFilterChange(range[0], newMax);
  };
  
  const percentMin = ((range[0] - minPrice) / (maxPrice - minPrice)) * 100;
  const percentMax = ((range[1] - minPrice) / (maxPrice - minPrice)) * 100;
  
  return (
    <div className="price-filter">
      <div className="price-filter-header">
        <h4>💰 Price Filter</h4>
        <span className="hotel-count">
          {filteredCount} of {hotelCount} hotels
        </span>
      </div>
      
      <div className="price-range-display">
        <span className="price-min">£{range[0]}</span>
        <span className="price-separator">—</span>
        <span className="price-max">£{range[1]}</span>
      </div>
      
      <div className="slider-container">
        <div className="slider-track">
          <div 
            className="slider-range"
            style={{
              left: `${percentMin}%`,
              width: `${percentMax - percentMin}%`
            }}
          />
        </div>
        
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={range[0]}
          onChange={(e) => handleMinChange(parseInt(e.target.value))}
          className="slider-input slider-min"
          onMouseDown={() => setIsDragging('min')}
          onMouseUp={() => setIsDragging(null)}
        />
        
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={range[1]}
          onChange={(e) => handleMaxChange(parseInt(e.target.value))}
          className="slider-input slider-max"
          onMouseDown={() => setIsDragging('max')}
          onMouseUp={() => setIsDragging(null)}
        />
      </div>
      
      <div className="price-filter-info">
        <p>Drag sliders to filter hotels by price</p>
        <p className="filter-note">Sold out hotels are always hidden</p>
      </div>
    </div>
  );
};