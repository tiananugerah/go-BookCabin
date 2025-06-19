import { apiClient } from './apiClient';

export interface Booking {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null | string;
  UserID: number;
  User: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: null | string;
    Email: string;
    Password: string;
    Name: string;
    Bookings: null | any[];
  };
  SeatID: number;
  Seat: {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: null | string;
    code: string;
    available: boolean;
    price: number;
    currency: string;
    row: number;
    segment: string;
    is_window: boolean;
    is_aisle: boolean;
    aircraft: string;
    characteristics: string[];
    Bookings: null | any[];
  };
  Status: string;
  BookedAt: string;
  Price: number;
  Currency: string;
}

class BookingService {
  async createBooking(seatId: number): Promise<Booking> {
    try {
      const response = await apiClient.post<Booking>('/api/bookings', { 
        seat_id: seatId 
      });
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getUserBookings(): Promise<Booking[]> {
    try {
      const response = await apiClient.get<Booking[]>('/api/bookings');
      return response.data;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: number): Promise<void> {
    try {
      await apiClient.post(`/api/bookings/${bookingId}/cancel`, {});
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();