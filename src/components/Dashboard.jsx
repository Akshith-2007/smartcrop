import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import LanguageSelector from './LanguageSelector';
import SoilForm from './SoilForm';
import CropRecommendation from './CropRecommendation';
import WeatherAlerts from './WeatherAlerts';
import PestDetection from './PestDetection';
import MarketPrices from './MarketPrices';

const Dashboard = ({ user, onLogout }) => {
  const { t } = useLanguage();
  const [cropRecommendations, setCropRecommendations] = useState([]);
  const [soilResult, setSoilResult] = useState(null);

  const handleSoilResult = (result) => {
    setSoilResult(result);
    if (result.cropRecommendations) {
      setCropRecommendations(result.cropRecommendations.recommendations || []);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('session_id');
      localStorage.removeItem('email');
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      // Still logout locally
      localStorage.removeItem('session_id');
      localStorage.removeItem('email');
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-soft sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-display">{t('app.title')}</h1>
                <p className="text-xs text-gray-500">{t('dashboard.welcome')}, <span className="font-medium text-gray-700">{user.email}</span></p>
              </div>
            </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Soil Analysis Form */}
          <div className="animate-fade-in">
            <SoilForm onResult={handleSoilResult} />
          </div>

          {/* Crop Recommendations */}
          {cropRecommendations.length > 0 && (
            <div className="animate-slide-up">
              <CropRecommendation recommendations={cropRecommendations} />
            </div>
          )}

          {/* Grid Layout for Weather, Pest, Market */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Alerts */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <WeatherAlerts />
            </div>

            {/* Pest Detection */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <PestDetection />
            </div>
          </div>

          {/* Market Prices */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <MarketPrices />
          </div>

          {/* Soil Analysis Results */}
          {soilResult && soilResult.soilAnalysis && (
            <div className="card p-6 md:p-8 animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-display">{t('soil.analysis')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    pH Status
                  </h3>
                  <p className="text-lg font-semibold text-gray-700 mb-1">
                    {soilResult.soilAnalysis.soil_analysis.ph.value} - 
                    <span className="text-primary-700 ml-2">{soilResult.soilAnalysis.soil_analysis.ph.status}</span>
                  </p>
                  {soilResult.soilAnalysis.soil_analysis.ph.recommendation && (
                    <p className="text-sm text-blue-700 mt-2 bg-blue-50 p-2 rounded-lg">
                      {soilResult.soilAnalysis.soil_analysis.ph.recommendation}
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Nutrient Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                      <span className="text-gray-600">Nitrogen:</span>
                      <span className="font-semibold text-gray-800">{soilResult.soilAnalysis.soil_analysis.nutrients.nitrogen}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                      <span className="text-gray-600">Phosphorus:</span>
                      <span className="font-semibold text-gray-800">{soilResult.soilAnalysis.soil_analysis.nutrients.phosphorus}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                      <span className="text-gray-600">Potassium:</span>
                      <span className="font-semibold text-gray-800">{soilResult.soilAnalysis.soil_analysis.nutrients.potassium}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 rounded-lg p-2">
                      <span className="text-gray-600">Moisture:</span>
                      <span className="font-semibold text-gray-800">{soilResult.soilAnalysis.soil_analysis.nutrients.moisture}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-primary-600 rounded-xl shadow-md">
                <p className="font-bold text-white text-lg flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Overall Health: {soilResult.soilAnalysis.overall_health}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

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

export default Dashboard;

