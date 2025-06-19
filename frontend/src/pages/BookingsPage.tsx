import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

import { Booking } from '../services/bookingService';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const userBookings = await bookingService.getUserBookings();
        setBookings(userBookings);
        setLoading(false);
      } catch (err) {
        setError('Failed to load booking data');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, navigate]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingService.cancelBooking(bookingId);
      // Update local state
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      alert('Booking cancelled successfully!');
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const formatDate = (dateInput: string | number) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <h1 className="text-center my-4">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="card text-center p-5">
          <h3>No bookings found</h3>
          <p>You haven't made any bookings yet.</p>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => navigate('/')}
          >
            Book a Seat
          </button>
        </div>
      ) : (
        <div className="card p-4">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Seat Number</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.seat_id}</td>
                    <td>{formatDate(booking.created_at)}</td>
                    <td>
                      <span className={`badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'confirmed' && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-4">
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/')}
            >
              Book Another Seat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;