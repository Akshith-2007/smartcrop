import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { weatherAPI } from '../services/api';

const WeatherAlerts = () => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let response;

      if (navigator.geolocation) {
        const getCurrentPosition = () =>
          new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
          });

        try {
          const position = await getCurrentPosition();
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          response = await weatherAPI.getAdvisory({ lat, lon, timezone });
        } catch (geoError) {
          response = await weatherAPI.getAdvisory({ timezone });
          setError('Location permission not granted. Showing nearest default weather.');
        }
      } else {
        response = await weatherAPI.getAdvisory({ timezone });
      }

      setWeather(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch weather';
      console.error('Weather API error:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">{t('weather.title')}</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">{t('weather.title')}</h2>
        </div>
        <p className="text-red-600 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">{error}</p>
      </div>
    );
  }

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="card p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">{t('weather.title')}</h2>
        </div>
        <button
          onClick={fetchWeather}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {weather && (
        <>
          <div className="mb-4 text-xs text-gray-500">
            Last updated: {weather.updated_at ? new Date(weather.updated_at).toLocaleString() : 'N/A'}
            {weather.location?.timezone ? ` | Timezone: ${weather.location.timezone}` : ''}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
              <svg className="w-6 h-6 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <p className="text-xs text-gray-600 mb-1 font-medium">{t('weather.rainfall')}</p>
              <p className="text-2xl font-bold text-blue-700">{weather.weather.rainfall_mm} mm</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
              <svg className="w-6 h-6 text-orange-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-xs text-gray-600 mb-1 font-medium">{t('weather.temperature')}</p>
              <p className="text-2xl font-bold text-orange-700">{weather.weather.temperature}°C</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
              <svg className="w-6 h-6 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <p className="text-xs text-gray-600 mb-1 font-medium">{t('weather.humidity')}</p>
              <p className="text-2xl font-bold text-green-700">{weather.weather.humidity}%</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t('weather.alerts')}
            </h3>
            {weather.alerts && weather.alerts.length > 0 ? (
              <div className="space-y-3">
                {weather.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 ${getAlertColor(alert.priority)} animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <p className="font-medium">{alert.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <p className="text-gray-600">{t('weather.noAlerts')}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherAlerts;

