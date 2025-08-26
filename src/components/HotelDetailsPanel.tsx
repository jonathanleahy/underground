import React from 'react';
import { getBookingUrl } from '../data/premier-inn-urls';
import './HotelDetailsPanel.css';

interface HotelDetailsPanelProps {
  hotel: any;
  isOpen: boolean;
  onClose: () => void;
  onBook: () => void;
  checkInDate: string;
  nights: number;
}

export const HotelDetailsPanel: React.FC<HotelDetailsPanelProps> = ({
  hotel,
  isOpen,
  onClose,
  onBook,
  checkInDate,
  nights
}) => {
  if (!isOpen || !hotel) return null;

  const handleBookNow = () => {
    const url = checkInDate
      ? getBookingUrl(hotel.hotel.id, {
          checkIn: checkInDate,
          nights: nights,
          adults: 2,
          children: 0
        })
      : getBookingUrl(hotel.hotel.id);
    
    window.open(url, '_blank');
    onBook();
  };

  return (
    <div className={`hotel-details-panel ${isOpen ? 'open' : ''}`}>
      <div className="details-header">
        <div className="details-title">
          <h3>{hotel.hotel.name}</h3>
          <p className="hotel-area">{hotel.hotel.area}</p>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="details-content">
        <div className="journey-section">
          <h4>Your Journey</h4>
          <div className="journey-steps">
            <div className="journey-step">
              <span className="step-icon">🏢</span>
              <div className="step-info">
                <span className="step-label">From Workplace</span>
                <span className="step-detail">{hotel.workplaceWalkTime} min walk to {hotel.workplaceStation?.name || 'station'}</span>
              </div>
            </div>
            
            <div className="journey-step">
              <span className="step-icon">🚇</span>
              <div className="step-info">
                <span className="step-label">Tube Journey</span>
                <span className="step-detail">
                  {hotel.tubeTime} min journey
                  {hotel.lineChanges > 0 && ` (${hotel.lineChanges} change${hotel.lineChanges > 1 ? 's' : ''})`}
                </span>
              </div>
            </div>
            
            <div className="journey-step">
              <span className="step-icon">🏨</span>
              <div className="step-info">
                <span className="step-label">To Hotel</span>
                <span className="step-detail">{hotel.hotelWalkTime} min walk from {hotel.hotelStation?.name || 'station'}</span>
              </div>
            </div>
          </div>

          <div className="journey-summary">
            <div className="total-time">
              <span className="summary-label">Total Journey Time</span>
              <span className="summary-value">{hotel.totalTime} minutes</span>
            </div>
          </div>
        </div>

        <div className="booking-section">
          <div className="price-info">
            <div className="price-main">
              <span className="price-amount">£{hotel.price}</span>
              <span className="price-period">per night</span>
            </div>
            {nights > 1 && (
              <div className="total-stay">
                Total for {nights} nights: <strong>£{hotel.totalCost}</strong>
              </div>
            )}
          </div>

          {hotel.roomsLeft && hotel.roomsLeft <= 3 && (
            <div className="urgency-badge">
              🔥 Only {hotel.roomsLeft} rooms left!
            </div>
          )}

          <button
            className="book-now-btn"
            onClick={handleBookNow}
            disabled={!hotel.available}
          >
            {hotel.available ? 'Book on Premier Inn →' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
};