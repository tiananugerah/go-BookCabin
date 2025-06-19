import { apiClient } from './apiClient';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends UserCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

class AuthService {
  private tokenCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start token check when service is instantiated
    this.startTokenCheck();
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      this.handleAuthResponse(response.data);
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async login(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      this.handleAuthResponse(response.data);
      return response.data;
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    this.stopTokenCheck();
    // Gunakan navigate dari react-router daripada window.location
  }

  private handleAuthResponse(response: AuthResponse): void {
    const expirationTime = new Date().getTime() + (response.expiresIn * 1000);
    localStorage.setItem('token', response.token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    this.startTokenCheck();
  }

  private startTokenCheck(): void {
    this.stopTokenCheck();
    this.tokenCheckInterval = setInterval(() => {
      if (!this.isAuthenticated()) {
        const event = new CustomEvent('auth:expired');
        window.dispatchEvent(event);
      }
    }, 30000); // Check setiap 30 detik
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');
    if (!token || !expiration) return false;
    return new Date().getTime() < parseInt(expiration);
  }

  private handleAuthError(error: any): void {
    console.error('Authentication error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    this.stopTokenCheck();
  }

  private stopTokenCheck(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }
}

export const authService = new AuthService();