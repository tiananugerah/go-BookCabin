import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

interface ApiClient {
  get<T>(url: string): Promise<AxiosResponse<T>>;
  post<T>(url: string, data: any): Promise<AxiosResponse<T>>;
}

class AxiosApiClient implements ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false  // Aktifkan kembali untuk mendukung CORS dengan credentials
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 307) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiration');
          // Gunakan window.location.replace untuk menghindari masalah history
          window.location.replace('/login');
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<AxiosResponse<T>> {
    try {
      return await this.instance.get<T>(url);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T>(url: string, data: any): Promise<AxiosResponse<T>> {
    try {
      return await this.instance.post<T>(url, data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;

      // Log error for debugging
      console.error(`API Error (${status}):`, message);

      // Handle specific error cases
      switch (status) {
        case 401:
          // Already handled in interceptor
          break;
        case 403:
          console.error('Permission denied');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An unexpected error occurred');
      }
    }
  }
}

// Create API client instance with base URL
const baseUrl = 'http://localhost:8080';
export const apiClient = new AxiosApiClient(baseUrl);