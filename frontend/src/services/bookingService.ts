import { apiClient } from './apiClient';

export interface Booking {
  id: number;
  seat_id: number;
  user_id: number;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  // Add other booking properties as needed
}

class BookingService {
  async createBooking(seatId: number): Promise<Booking> {
    const response = await apiClient.post<Booking>('/api/bookings', { seat_id: seatId });
    return response.data;
  }

  async getUserBookings(): Promise<Booking[]> {
    const response = await apiClient.get<Booking[]>('/api/bookings');
    return response.data;
  }

  async cancelBooking(bookingId: number): Promise<void> {
    await apiClient.post(`/api/bookings/${bookingId}/cancel`, {});
  }
}

export const bookingService = new BookingService();