import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { seatService, Seat } from '../services/seatService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import './SeatSelectionPage.css';

const SeatSelectionPage: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSeats = async () => {
      try {
        const allSeats = await seatService.getAllSeats();
        setSeats(allSeats);
        setLoading(false);
      } catch (err) {
        setError('Failed to load seat data');
        setLoading(false);
      }
    };

    fetchSeats();
  }, [isAuthenticated, navigate]);

  const handleSeatSelect = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (seat && !seat.isBooked) {
      setSelectedSeat(seatId);
    }
  };

  const handleBookSeat = async () => {
    if (!selectedSeat) return;
    
    try {
      await bookingService.createBooking(parseInt(selectedSeat));
      setSeats(seats.map(seat => 
        seat.id === selectedSeat ? { ...seat, isBooked: true } : seat
      ));
      setSelectedSeat(null);
      alert('Seat booked successfully!');
    } catch (err) {
      setError('Failed to book seat');
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.isBooked) return 'bg-danger';
    if (seat.id === selectedSeat) return 'bg-success';
    
    if (seat.class === 'First') return 'bg-primary';
    if (seat.class === 'Business') return 'bg-info';
    return 'bg-light';
  };

  const renderSeat = (seat: Seat) => (
    <div 
      key={seat.id}
      className={`seat m-1 ${getSeatColor(seat)} border rounded`}
      style={{ 
        width: '60px', 
        height: '80px', 
        cursor: seat.isBooked ? 'not-allowed' : 'pointer',
        position: 'relative'
      }}
      onClick={() => handleSeatSelect(seat.id)}
    >
      <div className="seat-content p-1 text-center">
        <div className="seat-code fw-bold">{seat.seatNumber}</div>
        {seat.price && seat.currency && (
          <div className="seat-price small">
            {seat.currency} {seat.price}
          </div>
        )}
        <div className="seat-features small">
          {seat.isWindow && <span className="badge bg-secondary me-1">W</span>}
          {seat.isAisle && <span className="badge bg-secondary">A</span>}
        </div>
      </div>
    </div>
  );

  const renderSeatRows = (classSeats: Seat[]) => {
    const rows = classSeats.reduce((acc: Record<string, Seat[]>, seat) => {
      const rowNum = seat.seatNumber.match(/\d+/)?.[0] || '0';
      if (!acc[rowNum]) acc[rowNum] = [];
      acc[rowNum].push(seat);
      return acc;
    }, {});

    return Object.entries(rows).map(([rowNum, rowSeats]) => (
      <div key={rowNum} className="row mb-2 justify-content-center">
        <div className="col-auto d-flex align-items-center me-2">
          Row {rowNum}
        </div>
        <div className="col-auto d-flex">
          {rowSeats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)).map(renderSeat)}
        </div>
      </div>
    ));
  };

  const renderCabinLayout = () => {
    const seatsByClass = seats.reduce((acc: Record<string, Seat[]>, seat) => {
      if (!acc[seat.class]) acc[seat.class] = [];
      acc[seat.class].push(seat);
      return acc;
    }, {});

    return (
      <div className="cabin-layout">
        <div className="cockpit mb-4">
          <div className="text-center p-2 bg-dark text-white rounded">Cockpit</div>
        </div>
        
        {Object.entries(seatsByClass).map(([seatClass, classSeats]) => (
          <div key={seatClass} className="cabin-section mb-4">
            <h3 className="text-center mb-3">{seatClass} Class</h3>
            <div className="seats-container">
              {renderSeatRows(classSeats)}
            </div>
          </div>
        ))}

        <div className="legend mt-4">
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <div className="seat bg-primary border me-2" style={{ width: '20px', height: '20px' }}></div>
              <span>First Class</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="seat bg-info border me-2" style={{ width: '20px', height: '20px' }}></div>
              <span>Business Class</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="seat bg-light border me-2" style={{ width: '20px', height: '20px' }}></div>
              <span>Economy Class</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="seat bg-success border me-2" style={{ width: '20px', height: '20px' }}></div>
              <span>Selected</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="seat bg-danger border me-2" style={{ width: '20px', height: '20px' }}></div>
              <span>Booked</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5">
        {error}
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="text-center my-4">Select Your Seat</h1>
      <div className="card p-4">
        {renderCabinLayout()}
      </div>
      
      <div className="mt-4 text-center">
        {selectedSeat && (
          <button 
            className="btn btn-primary btn-lg me-2" 
            onClick={handleBookSeat}
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Selected Seat'}
          </button>
        )}
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => navigate('/bookings')}
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
};

export default SeatSelectionPage;