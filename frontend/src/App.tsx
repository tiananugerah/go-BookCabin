import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import BookingsPage from './pages/BookingsPage';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">BookCabin</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Seat Selection</Link>
          <Link className="nav-link" to="/bookings">My Bookings</Link>
          <button className="nav-link btn btn-link" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="d-flex justify-content-center p-5"><div className="spinner-border" role="status"></div></div>;
  }

  return isAuthenticated ? 
    children : 
    <Navigate to="/login" state={{ from: location }} replace />;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="d-flex justify-content-center p-5"><div className="spinner-border" role="status"></div></div>;
  }

  return isAuthenticated ? 
    <Navigate to="/" replace /> : 
    children;
};

const AppContent = () => {
  return (
    <>
      <Navigation />
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><SeatSelectionPage /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
