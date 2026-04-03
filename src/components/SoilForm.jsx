import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFarm } from '../context/FarmContext';
import { soilAPI, cropAPI } from '../services/api';

const SoilForm = ({ onResult }) => {
  const { t } = useLanguage();
  const { handleSoilResult } = useFarm();
  const [formData, setFormData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    moisture: '',
    region: '',
    season: 'rainy',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Analyze soil and get fertilizer recommendation
      const soilResponse = await soilAPI.analyze({
        ph: parseFloat(formData.ph),
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        moisture: parseFloat(formData.moisture),
        region: formData.region,
      });

      // Get crop recommendations
      const cropResponse = await cropAPI.recommend({
        region: formData.region || 'Andhra Pradesh',
        season: formData.season,
        soil_ph: parseFloat(formData.ph),
      });

      const finalResult = {
        soilAnalysis: soilResponse.data,
        cropRecommendations: cropResponse.data,
        inputData: {
          ph: parseFloat(formData.ph),
          nitrogen: parseFloat(formData.nitrogen),
          phosphorus: parseFloat(formData.phosphorus),
          potassium: parseFloat(formData.potassium),
          moisture: parseFloat(formData.moisture),
          region: formData.region,
          season: formData.season,
        },
      };

      setResult(finalResult);
      handleSoilResult(finalResult);
      if (onResult) onResult(finalResult);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze soil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-earth-500 to-earth-700 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-display">{t('soil.title')}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('soil.ph')}
            </label>
            <input
              type="number"
              name="ph"
              value={formData.ph}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="14"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('soil.nitrogen')}
            </label>
            <input
              type="number"
              name="nitrogen"
              value={formData.nitrogen}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('soil.phosphorus')}
            </label>
            <input
              type="number"
              name="phosphorus"
              value={formData.phosphorus}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('soil.potassium')}
            </label>
            <input
              type="number"
              name="potassium"
              value={formData.potassium}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('soil.moisture')}
            </label>
            <input
              type="number"
              name="moisture"
              value={formData.moisture}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('soil.region')}
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Andhra Pradesh"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('soil.season')}
            </label>
            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="summer">Summer</option>
              <option value="winter">Winter</option>
              <option value="rainy">Rainy</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm animate-scale-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.loading')}
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('soil.submit')}
            </span>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-5 bg-gradient-to-r from-green-500 to-primary-600 rounded-xl shadow-md animate-scale-in">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            {t('soil.fertilizer')}
          </h3>
          <p className="text-white text-lg font-semibold">
            {result.soilAnalysis.fertilizer_recommendation.fertilizer_type} 
            <span className="text-green-100 ml-2">
              ({(result.soilAnalysis.fertilizer_recommendation.confidence * 100).toFixed(1)}% confidence)
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SoilForm;

