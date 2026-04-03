import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { FarmProvider } from './context/FarmContext';
import { authAPI } from './services/api';
import Login from './components/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import FarmSetupPage from './pages/FarmSetupPage';
import CropAdvisoryPage from './pages/CropAdvisoryPage';
import WeatherPage from './pages/WeatherPage';
import PestDetectionPage from './pages/PestDetectionPage';
import MarketPricesPage from './pages/MarketPricesPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      const email = localStorage.getItem('email');

      if (sessionId && email) {
        const response = await authAPI.checkSession(sessionId);
        if (response.data && response.data.authenticated) {
          setUser({ email: response.data.email || email });
        } else {
          localStorage.removeItem('session_id');
          localStorage.removeItem('email');
        }
      }
    } catch (err) {
      console.error('Session check error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('session_id');
        localStorage.removeItem('email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <FarmProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} 
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout}>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout}>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm-setup"
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout}>
                  <FarmSetupPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/crop-advisory"
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout}>
                  <CropAdvisoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout}>
                  <WeatherPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pest-detection"
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout}>
                  <PestDetectionPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/market-prices"
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout}>
                  <MarketPricesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </FarmProvider>
    </LanguageProvider>
  );
}

export default App;

