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
    setBookings(bookings.filter(booking => booking.ID !== bookingId));
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
                            <th>Seat Code</th>
                            <th>Segment</th>
                            <th>Price</th>
                            <th>Booking Date</th>
                            <th>Status</th>
                            <th>Seat Details</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                        <tr key={booking.ID}>
                            <td className="fw-bold">{booking.Seat.code}</td>
                            <td>
                                <span className="badge bg-info text-dark">
                                  {booking.Seat.segment}
                                </span>
                            </td>
                            <td>
                                <span className="fw-bold">
                                  {booking.Price} {booking.Currency}
                                </span>
                            </td>
                            <td>{formatDate(booking.BookedAt)}</td>
                            <td>
                                <span className={`badge ${booking.Status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                                  {booking.Status}
                                </span>
                            </td>
                            <td>
                                <div className="small">
                                  <div className="mb-1">
                                    {booking.Seat.is_window && '🪟 Window Seat'}
                                    {booking.Seat.is_aisle && '🚶 Aisle Seat'}
                                  </div>
                                  <div>Aircraft: {booking.Seat.aircraft}</div>
                                  <div className="text-muted">
                                    {booking.Seat.characteristics.join(', ')}
                                  </div>
                                </div>
                            </td>
                            <td>
                                {booking.Status === 'confirmed' && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleCancelBooking(booking.ID)}
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
        </div>
        )}
    </div>
    );
    };

    export default BookingsPage;
