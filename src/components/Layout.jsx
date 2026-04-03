import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import LanguageSelector from './LanguageSelector';

const Layout = ({ user, onLogout, children }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('session_id');
      localStorage.removeItem('email');
      onLogout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('session_id');
      localStorage.removeItem('email');
      onLogout();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: t('dashboard.title'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/farm-setup', label: t('soil.title'), icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { path: '/crop-advisory', label: t('crop.recommendations'), icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { path: '/weather', label: t('weather.title'), icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
    { path: '/pest-detection', label: t('pest.title'), icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { path: '/market-prices', label: t('market.title'), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-soft sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/dashboard" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-display">{t('app.title')}</h1>
                <p className="text-xs text-gray-500">{t('dashboard.welcome')}, <span className="font-medium text-gray-700">{user?.email}</span></p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('login.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <nav className="card p-4 sticky top-24">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-primary-50 text-primary-700 font-semibold border-l-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive(item.path) ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="text-xs">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              Smart Crop Advisory System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
