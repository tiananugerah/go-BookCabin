import { apiClient } from './apiClient';

export interface Seat {
  id: string;
  seatNumber: string;
  isBooked: boolean;
  class: 'Economy' | 'Business' | 'First';
  price?: number;
  currency?: string;
  isWindow?: boolean;
  isAisle?: boolean;
}

class SeatService {
  async getAllSeats(): Promise<Seat[]> {
    const response = await apiClient.get<any[]>('/api/seats');
    console.log(response.data)
    return response.data.map(seat => ({
      id: seat.ID.toString(),
      seatNumber: seat.code || '',
      isBooked: !seat.available,
      class: this.determineClass(parseInt(seat.code?.match(/\d+/)?.[0] || '0')),
      price: seat.price,
      currency: seat.currency,
      isWindow: seat.characteristics?.includes('W'),
      isAisle: seat.characteristics?.includes('A')
    }));
  }

  private determineClass(rowNumber: number): 'Economy' | 'Business' | 'First' {
    if (rowNumber <= 2) return 'First';
    if (rowNumber <= 7) return 'Business';
    return 'Economy';
  }

  async getAvailableSeats(): Promise<Seat[]> {
    const response = await apiClient.get<Seat[]>('/api/seats/available');
    return response.data;
  }

  async importSeats(): Promise<void> {
    await apiClient.post('/api/seats/import', {});
  }
}

export const seatService = new SeatService();