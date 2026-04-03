import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const CropRecommendation = ({ recommendations = [], onSelectCrop, selectedCrop }) => {
  const { t } = useLanguage();

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">{t('crop.recommendations')}</h2>
        </div>
        <p className="text-gray-600">Enter soil data to get crop recommendations</p>
      </div>
    );
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">{t('crop.recommendations')}</h2>
          <p className="text-sm text-gray-500 mt-1">Select a crop below to view its intelligent fertilizer schedule.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.map((crop, index) => {
          const isSelected = selectedCrop?.crop === crop.crop;
          return (
            <div
              key={index}
              onClick={() => onSelectCrop(crop)}
              className={`group relative cursor-pointer border rounded-xl p-5 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 ${
                isSelected 
                  ? 'bg-gradient-to-br from-primary-50 to-emerald-100 border-primary-500 shadow-md ring-2 ring-primary-500 ring-opacity-50' 
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              }`}
            >
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/60 rounded-full flex items-center justify-center">
                <span className={`text-xs font-bold ${isSelected ? 'text-primary-800' : 'text-primary-700'}`}>#{index + 1}</span>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-primary-800 mb-3 font-display flex items-center gap-2">
                  {crop.crop}
                  {isSelected && (
                    <svg className="w-5 h-5 text-primary-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                </h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="text-gray-600"><span className="font-semibold text-gray-700">{t('crop.waterNeed')}:</span> {crop.water_need}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600"><span className="font-semibold text-gray-700">{t('crop.phRange')}:</span> {crop.ph_range}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-gray-600"><span className="font-semibold text-gray-700">Season:</span> <span className="capitalize">{crop.season}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600"><span className="font-semibold text-gray-700">Region:</span> {crop.region}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CropRecommendation;

