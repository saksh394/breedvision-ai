// src/pages/user/UserResult.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getAnalysis } from '../../services/api';
import { getBreedFactsheet } from '../../data/breedData';
import { useLanguage } from '../../context/LanguageContext';
import Icons from '../../components/common/Icons';
import Toast from '../../components/common/Toast';

export default function UserResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Use result passed via navigation state first (instant, no Supabase fetch needed)
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [loading, setLoading] = useState(!location.state?.analysis);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Only fetch from Supabase if we don't already have the result
    if (!location.state?.analysis) {
      fetchResult();
    }
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const data = await getAnalysis(id);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = () => {
    setToastMessage('Result saved successfully to your history.');
    setTimeout(() => {
      navigate('/user/history');
    }, 1200);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-sm font-medium text-slate-500">Loading analysis result...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-md py-16 text-left space-y-4">
        <Icons.AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-base font-semibold text-slate-800">Result not found</p>
        <button onClick={() => navigate('/user/upload')} className="btn-primary">
          Back to Upload
        </button>
      </div>
    );
  }

  const factsheet = getBreedFactsheet(analysis.predictedBreed);

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <div className="card p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('resultTitle')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Analysis ID: <span className="font-mono font-semibold">{analysis.id}</span> • Date: {analysis.date}
            </p>
          </div>
          <span className="badge badge-pending self-start sm:self-auto">
            Status: {analysis.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Uploaded Animal Image */}
          <div className="space-y-3">
            <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm">
              <img
                src={analysis.imageUrl}
                alt={analysis.predictedBreed}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>Specimen: {analysis.animalType}</span>
              {analysis.earTagId && analysis.earTagId !== 'N/A' && (
                <span className="font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Tag: {analysis.earTagId}
                </span>
              )}
            </div>
          </div>

          {/* Primary Breed & Predictions */}
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                Predicted Breed
              </div>
              <div className="text-2xl font-bold text-emerald-950 mt-0.5">
                {analysis.predictedBreed}
              </div>
              <div className="flex items-center space-x-3 mt-1.5">
                <span className="text-xs font-bold text-emerald-800">
                  {t('confidenceScore')}: {analysis.confidence}%
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-emerald-700">
                  {analysis.breedStatus}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('topPredictions')}
              </div>
              <div className="space-y-2">
                {analysis.top3Predictions?.map((pred, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-800">
                      {index + 1}. {pred.breed}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${pred.confidence}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-700 w-9 text-right">
                        {pred.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Morphological Trait Markers */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.Dna className="w-4 h-4 text-emerald-700" />
            <span>{t('morphologicalMarkers')}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {factsheet.morphologicalMarkers?.map((marker, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {marker.part}
                </span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {marker.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: NBAGR Breed Factsheet & Dairy Profile */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.Reports className="w-4 h-4 text-emerald-700" />
            <span>{t('economicFactsheet')}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                {t('milkYield')}
              </span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                {factsheet.milkYield}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                {t('fatPercentage')}
              </span>
              <span className="text-xs font-bold text-emerald-800 mt-0.5 block">
                {factsheet.fatPercentage}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                {t('accessionCode')}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-900 mt-0.5 block truncate">
                {factsheet.nbagrCode}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                {t('originState')}
              </span>
              <span className="text-xs font-medium text-slate-900 mt-0.5 block">
                {factsheet.origin}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                {t('climateSuitability')}
              </span>
              <span className="text-xs font-medium text-slate-900 mt-0.5 block">
                {factsheet.climateSuitability}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-slate-200">
          <button
            onClick={() => navigate(`/user/gradcam/${analysis.id}`)}
            className="btn-primary text-xs px-4 py-2 flex items-center space-x-1.5"
          >
            <Icons.Eye className="w-3.5 h-3.5" />
            <span>{t('viewGradCam')}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn-secondary text-xs px-4 py-2 flex items-center space-x-1.5"
          >
            <Icons.Download className="w-3.5 h-3.5" />
            <span>{t('downloadReport')}</span>
          </button>
          <button
            onClick={handleSaveResult}
            className="btn-secondary text-xs px-4 py-2"
          >
            Save to History
          </button>
          <button
            onClick={() => navigate('/user/upload')}
            className="btn-secondary text-xs px-4 py-2"
          >
            Analyze Another Animal
          </button>
        </div>
      </div>
    </div>
  );
}

