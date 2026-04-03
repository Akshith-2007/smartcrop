import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFarm } from '../context/FarmContext';
import CropRecommendation from '../components/CropRecommendation';
import FertilizerSchedule from '../components/FertilizerSchedule';

const CropAdvisoryPage = () => {
  const { t } = useLanguage();
  const { cropRecommendations, soilResult } = useFarm();
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Automatically select the first crop if not selected and recommendations exist
  React.useEffect(() => {
    if (cropRecommendations?.length > 0 && !selectedCrop) {
      setSelectedCrop(cropRecommendations[0]);
    }
  }, [cropRecommendations, selectedCrop]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">{t('crop.recommendations')}</h1>
            <p className="text-gray-600 mt-1">Get personalized crop recommendations and fertilizer schedules based on your soil analysis</p>
          </div>
        </div>
      </div>

      {cropRecommendations.length === 0 ? (
        <div className="card p-6 bg-gradient-to-r from-primary-50 to-green-50 border border-primary-200">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">How to get crop recommendations</h3>
              <p className="text-sm text-gray-700 mb-3">
                Complete the soil analysis in <Link to="/farm-setup" className="font-semibold text-primary-700 hover:text-primary-800 underline">Farm Setup</Link> to receive personalized crop recommendations tailored to your soil conditions, region, and season.
              </p>
              <Link
                to="/farm-setup"
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Go to Farm Setup
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <CropRecommendation 
            recommendations={cropRecommendations} 
            selectedCrop={selectedCrop}
            onSelectCrop={setSelectedCrop}
          />
          {selectedCrop && (
            <FertilizerSchedule 
              selectedCrop={selectedCrop} 
              soilResult={soilResult} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default CropAdvisoryPage;
