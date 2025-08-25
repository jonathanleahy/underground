import React, { useState } from 'react';
import './DatePicker.css';

interface DatePickerProps {
  onDateChange: (checkIn: string, nights: number, adults: number, children: number) => void;
  onSearch: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ onDateChange, onSearch }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [nights, setNights] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    onDateChange(checkIn, nights, adults, children);
    await onSearch();
    setIsLoading(false);
  };

  let checkOut = new Date(checkIn);
  if (isNaN(checkOut.getTime())) {
    checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 1);
  } else {
    checkOut.setDate(checkOut.getDate() + nights);
  }

  return (
    <div className="date-picker-container">
      <div className="date-picker-header">
        <h4>🏨 Check Hotel Availability</h4>
      </div>
      
      <div className="date-picker-controls">
        <div className="date-row">
          <div className="date-input-group">
            <label htmlFor="check-in">Check-in</label>
            <input
              id="check-in"
              type="date"
              value={checkIn}
              min={tomorrow.toISOString().split('T')[0]}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          
          <div className="nights-input-group">
            <label htmlFor="nights">Nights</label>
            <select
              id="nights"
              value={nights}
              onChange={(e) => setNights(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 14, 21, 28].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          
          <div className="date-input-group">
            <label>Check-out</label>
            <input
              type="date"
              value={checkOut.toISOString().split('T')[0]}
              disabled
              className="checkout-display"
            />
          </div>
        </div>
        
        <div className="guest-row">
          <div className="guest-input-group">
            <label htmlFor="adults">Adults</label>
            <select
              id="adults"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          
          <div className="guest-input-group">
            <label htmlFor="children">Children</label>
            <select
              id="children"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value))}
            >
              {[0, 1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          
          <div className="total-guests">
            <label>Total Guests</label>
            <div className="guest-total">{adults + children}</div>
          </div>
        </div>
        
        <button
          className="search-availability-btn"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <>⏳ Checking...</>
          ) : (
            <>🔍 Check Prices</>
          )}
        </button>
      </div>
      
      <div className="date-picker-info">
        <p>Select dates to see real-time Premier Inn pricing</p>
      </div>
    </div>
  );
};