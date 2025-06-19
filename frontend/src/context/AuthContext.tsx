import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = () => {
      try {
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    initAuth();
    const interval = setInterval(initAuth, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.token) {
        setIsAuthenticated(true);
        const from = location.state?.from?.pathname || "/";
        // Tunggu state terupdate
        await new Promise(resolve => setTimeout(resolve, 100));
        navigate(from, { replace: true });
      } else {
        throw new Error('Token tidak ditemukan dalam response');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.register({ name, email, password });
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading,
      login, 
      register, 
      logout 
    }}>
      {!isInitialized ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};