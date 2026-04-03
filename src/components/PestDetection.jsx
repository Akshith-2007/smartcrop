import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { pestAPI } from '../services/api';

const PestDetection = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await pestAPI.detect(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to detect pest/disease');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-display">{t('pest.title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('pest.upload')}
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
            />
          </div>
          {file && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-scale-in">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-700 font-medium">Selected: <span className="text-green-700">{file.name}</span></p>
            </div>
          )}
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
          disabled={loading || !file}
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
              Detect Pest / Disease
            </span>
          )}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-5 rounded-xl border-l-4 animate-scale-in ${
          result.is_reliable !== false 
            ? 'bg-blue-50 border-blue-500' 
            : 'bg-yellow-50 border-yellow-500'
        }`}>
          <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${
            result.is_reliable !== false ? 'text-blue-900' : 'text-yellow-900'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('pest.detected')}: <span className="capitalize">{result.disease_detected}</span>
          </h3>
          {result.detection_type && result.detection_type !== 'unknown' && (
            <p className={`text-sm mb-2 ${
              result.is_reliable !== false ? 'text-blue-700' : 'text-yellow-700'
            }`}>
              <span className="font-medium">Type:</span> {result.detection_type === 'pest' ? 'Pest' : 'Disease'}
            </p>
          )}
          {result.model_label && (
            <p className="text-xs text-gray-600 mb-2">
              Photo analysis label: {result.model_label}
            </p>
          )}
          {result.model_provider && (
            <p className="text-xs text-gray-600 mb-2">
              Model: {result.model_provider}{result.model_id ? ` (${result.model_id})` : ''}
            </p>
          )}
          
          {result.photo_tip && (
            <div className="mb-3 p-2 border rounded text-sm bg-blue-50 border-blue-200 text-blue-800">
              {result.photo_tip}
            </div>
          )}
          {result.warning && (
            <div className="mb-3 p-2 border rounded text-sm bg-yellow-100 border-yellow-400 text-yellow-800">
              {result.warning}
            </div>
          )}
          
          <p className={`text-sm mb-2 ${
            result.is_reliable !== false ? 'text-blue-700' : 'text-yellow-700'
          }`}>
            <span className="font-medium">{t('pest.confidence')}:</span> {result.confidence_percentage || (result.confidence * 100).toFixed(1)}%
          </p>
          
          {/* BUG FIX DD-002: Only show control measures if confidence >= 90% and available */}
          {result.control_measures_available !== false && 
           result.control_measures && 
           result.control_measures.length > 0 && 
           result.disease_detected !== 'Unable to Classify' && 
           result.disease_detected !== 'Unknown / Uncertain' && (
            <div className="mt-3">
              <p className={`font-medium mb-2 ${
                result.is_reliable !== false ? 'text-blue-800' : 'text-yellow-800'
              }`}>
                {t('pest.controlMeasures')}:
              </p>
              <ul className={`list-disc list-inside space-y-1 text-sm ${
                result.is_reliable !== false ? 'text-blue-700' : 'text-yellow-700'
              }`}>
                {result.control_measures.map((measure, index) => (
                  <li key={index}>{measure}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.image_path && (
            <p className="text-xs text-gray-600 mt-3">Image saved: {result.image_path}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PestDetection;

