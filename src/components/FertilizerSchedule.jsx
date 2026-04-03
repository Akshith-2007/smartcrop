import React, { useState, useEffect } from 'react';
import { soilAPI } from '../services/api';

const FertilizerSchedule = ({ selectedCrop, soilResult }) => {
  const [schedule, setSchedule] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Analyze soil and live weather to decide timing for fertilizer application
  useEffect(() => {
    if (!selectedCrop) {
      setSchedule([]);
      setAlerts([]);
      return;
    }

    setLoading(true);
    setError('');

    const analyzeFertilizerWindow = async () => {
      try {
        const nutrients = soilResult?.soilAnalysis?.soil_analysis?.nutrients || {};
        const payload = {
          crop: selectedCrop?.crop,
          nitrogen: nutrients.nitrogenValue ?? soilResult?.inputData?.nitrogen ?? 0,
          phosphorus: nutrients.phosphorusValue ?? soilResult?.inputData?.phosphorus ?? 0,
          potassium: nutrients.potassiumValue ?? soilResult?.inputData?.potassium ?? 0,
          moisture: nutrients.moistureValue ?? soilResult?.inputData?.moisture ?? 0,
        };

        const response = await soilAPI.recommendFertilizer(payload);
        const recommendationData = response.data || {};
        const normalizedSchedule = (recommendationData.recommendations || []).map((item) => ({
          id: item.id,
          phase: item.phase,
          timing: item.timing,
          bestTime: item.best_time,
          fertilizer: item.fertilizer,
          reason: item.reason,
          weatherNote: item.weather_note,
        }));

        setSchedule(normalizedSchedule);
        setAlerts(recommendationData.alerts || []);
      } catch (apiError) {
        setError('Unable to load fertilizer timing recommendations right now.');
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    analyzeFertilizerWindow();
  }, [selectedCrop, soilResult]);

  if (!selectedCrop) return null;

  return (
    <div className="card p-6 md:p-8 mt-8 animate-fade-in border-t-4 border-t-amber-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Fertilizer Schedule</h2>
        </div>
      </div>
      <p className="text-gray-600 mb-8 ml-15">
        Best fertilizer timing for <span className="font-semibold text-primary-700">{selectedCrop.crop}</span> based on your soil nutrients and the weather forecast.
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-full font-medium shadow-sm">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing data inputs...
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      ) : (
        <>
          {alerts.length > 0 && (
            <div className="mb-5 space-y-2">
              {alerts.map((alert, index) => (
                <div key={`${alert}-${index}`} className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                  {alert}
                </div>
              ))}
            </div>
          )}

          {schedule.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
              No recommendation data available yet.
            </div>
          ) : (
            <div className="relative border-l-2 border-amber-200 ml-4 md:ml-6 space-y-8">
              {schedule.map((step) => (
                <div key={step.id} className="relative pl-8 md:pl-10">
                  {/* Timeline dot */}
                  <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-amber-500 shadow-sm"></div>
                  
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-2 tracking-wide uppercase">
                          {step.timing}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{step.phase}</h3>
                        <p className="text-primary-700 font-semibold">{step.fertilizer}</p>
                      {step.bestTime && (
                        <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          Best time: {step.bestTime}
                        </span>
                      )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {/* Soil Reason */}
                      <div className="flex items-start gap-3 bg-green-50/50 p-3 rounded-lg border border-green-100">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Soil Strategy:</span> {step.reason}</p>
                      </div>

                      {/* Weather Note */}
                      <div className={`flex items-start gap-3 p-3 rounded-lg border ${step.weatherNote?.toLowerCase().includes('delay') || step.weatherNote?.toLowerCase().includes('heavy') ? 'bg-red-50/50 border-red-100' : 'bg-blue-50/50 border-blue-100'}`}>
                        <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${step.weatherNote?.toLowerCase().includes('delay') || step.weatherNote?.toLowerCase().includes('heavy') ? 'text-red-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Weather Context:</span> {step.weatherNote}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FertilizerSchedule;
