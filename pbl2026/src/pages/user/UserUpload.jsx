// src/pages/user/UserUpload.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { uploadImage, analyzeImage, getHistory } from '../../services/api';
import { analyzeImageQuality } from '../../utils/imageQuality';
import Icons from '../../components/common/Icons';
import ImageUpload from '../../components/common/ImageUpload';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';

export default function UserUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState(null);

  // Pre-inference Quality State
  const [qualityReport, setQualityReport] = useState(null);
  const [qualityChecking, setQualityChecking] = useState(false);
  const [earTagId, setEarTagId] = useState('');

  // Recent analyses state for right-side column
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    fetchRecentAnalyses();
  }, [currentUser]);

  const fetchRecentAnalyses = async () => {
    try {
      setLoadingHistory(true);
      const data = await getHistory(currentUser?.id);
      setRecentAnalyses(data.slice(0, 4));
    } catch (err) {
      console.error('Failed to load recent history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleImageSelected = async (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
    setQualityChecking(true);

    try {
      const report = await analyzeImageQuality(url);
      setQualityReport(report);
    } catch (err) {
      console.error(err);
    } finally {
      setQualityChecking(false);
    }
  };

  const handleChangeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setQualityReport(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !previewUrl) return;
    console.log('[Upload] handleAnalyze clicked, file:', selectedFile?.name);

    setAnalyzing(true);
    setError(null);
    setAnalysisStep(0);

    try {
      // Advance steps visually while backend works
      const stepTimer1 = setTimeout(() => setAnalysisStep(1), 800);
      const stepTimer2 = setTimeout(() => setAnalysisStep(2), 1600);

      const uploaded = await uploadImage(selectedFile);

      const result = await analyzeImage(
        { ...uploaded, file: selectedFile },
        currentUser?.id,
        currentUser?.name,
        {
          earTagId: earTagId || 'N/A',
          qualityScore: qualityReport?.score || 90
        }
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      // Pass result via navigation state so result page renders instantly
      // without waiting for a Supabase fetch
      navigate(`/user/result/${result.id}`, { state: { analysis: result } });
    } catch (err) {
      setAnalyzing(false);
      setError(err.isRejection ? err.message : 'Unable to analyze this image. Please try again.');
      console.error('[Upload] analyze error:', err.message);
    }
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: Upload Animal Image (Image 1 Layout) ================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card p-6 border-slate-200">
            {/* Header */}
            <div className="mb-5 pb-3 border-b border-slate-100">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Upload Animal Image
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Get an AI-powered breed prediction from your image.
              </p>
            </div>

            {analyzing ? (
              <LoadingState
                title={t('analyzingText')}
                steps={[
                  t('stepExtracting'),
                  t('stepMatching'),
                  t('stepGenerating')
                ]}
                currentStep={analysisStep}
              />
            ) : error ? (
              <ErrorState
                title="Analysis Failed"
                message={error}
                retryText="Try Again"
                onRetry={handleChangeImage}
              />
            ) : (
              <div className="space-y-5">
                {/* Upload Area / Dropzone */}
                <ImageUpload
                  onImageSelected={handleImageSelected}
                  onAnalyze={handleAnalyze}
                  previewUrl={previewUrl}
                  onChangeImage={handleChangeImage}
                  analyzing={analyzing}
                />

                {/* Optional Ear Tag / Pashu Aadhaar Input */}
                {previewUrl && (
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      12-Digit Ear Tag / Bharat Pashudhan INAPH ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1002 9481 0293"
                      value={earTagId}
                      onChange={(e) => setEarTagId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                )}

                {/* Pre-Inference Quality Scorecard */}
                {previewUrl && qualityReport && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center space-x-1.5">
                        <Icons.Sparkles className="w-4 h-4 text-emerald-700" />
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {t('qualityCheckTitle')}
                        </h3>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                          qualityReport.badgeColor === 'emerald'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : qualityReport.badgeColor === 'amber'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-teal-100 text-teal-800 border-teal-300'
                        }`}
                      >
                        {qualityReport.score}% Score • {qualityReport.grade}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                          {t('sharpness')}
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block text-xs">
                          {qualityReport.metrics.sharpness?.label}
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                          {t('lighting')}
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block text-xs">
                          {qualityReport.metrics.lighting?.label}
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                          {t('contrast')}
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block text-xs">
                          {qualityReport.metrics.contrast?.label}
                        </span>
                      </div>

                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                          {t('resolution')}
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block text-xs">
                          {qualityReport.metrics.resolution?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section: Tips for a better result */}
                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Icons.Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Tips for a better result</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 pl-4 list-disc marker:text-slate-400">
                    <li>Use a clear image of the animal</li>
                    <li>Keep the animal clearly visible</li>
                    <li>Avoid very dark or blurry images</li>
                  </ul>
                </div>

                {/* Section: How it works */}
                <div className="pt-4 border-t border-slate-100 text-xs">
                  <div className="font-bold text-slate-800 mb-2">
                    How it works
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-800">① Upload Image</span>
                    <span className="text-slate-400 font-bold">→</span>
                    <span className="font-medium text-slate-800">② AI Analysis</span>
                    <span className="text-slate-400 font-bold">→</span>
                    <span className="font-medium text-slate-800">③ View Result</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Recent Analyses (Image 2 Layout) ================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 border-slate-200">
            {/* Header with View All */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Recent Analyses
              </h2>
              <Link
                to="/user/history"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                View All
              </Link>
            </div>

            {/* List of Recent Items */}
            {loadingHistory ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading recent analyses...
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No analyses yet. Upload an image to get started.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAnalyses.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-3 group"
                  >
                    {/* Left: Thumbnail and info */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.predictedBreed}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {item.predictedBreed}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Confidence {item.confidence}%
                        </p>
                        <div className="flex items-center space-x-1.5 text-[11px] mt-1">
                          <StatusBadge status={item.status} size="sm" />
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{item.date || 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: View Action Button */}
                    <button
                      onClick={() => navigate(`/user/result/${item.id}`)}
                      className="text-xs font-semibold text-slate-700 hover:text-emerald-700 flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 flex-shrink-0 transition-colors"
                    >
                      <span>View</span>
                      <span>→</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Button: View Full History */}
            <div className="pt-4 mt-2 border-t border-slate-100">
              <button
                onClick={() => navigate('/user/history')}
                className="w-full btn-secondary text-xs py-2 text-center block"
              >
                [ View Full History ]
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

