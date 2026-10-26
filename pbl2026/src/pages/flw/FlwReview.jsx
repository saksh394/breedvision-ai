// src/pages/flw/FlwReview.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReview, verifyPrediction, correctPrediction } from '../../services/api';
import { getBreedFactsheet } from '../../data/breedData';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Edit3 } from 'lucide-react';
import Icons from '../../components/common/Icons';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';

const INDIAN_BREEDS = [
  'Gir',
  'Sahiwal',
  'Red Sindhi',
  'Tharparkar',
  'Kankrej',
  'Rathi',
  'Hariana',
  'Ongole',
  'Deoni',
  'Krishna Valley',
  'Hallikar',
  'Amritmahal',
  'Khillari',
  'Bargur',
  'Holstein Friesian (HF)',
  'Jersey',
  'Murrah',
  'Jaffarabadi',
  'Surti',
  'Mehsana',
  'Bhadawari',
  'Nili-Ravi',
  'Pandharpuri',
  'Toda'
];

export default function FlwReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for verification & correction flows
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState('Sahiwal');
  const [breedStatus, setBreedStatus] = useState('Pure');
  const [comment, setComment] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getReview(id);
      setAnalysis(data);
      if (data?.predictedBreed) {
        setSelectedBreed(data.predictedBreed);
      }
      if (data?.breedStatus) {
        setBreedStatus(data.breedStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVerification = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyPrediction(id, {
        flwId: currentUser?.id,
        flwName: currentUser?.name,
        comment: 'Verified as accurate by field-level worker.'
      });
      setAnalysis(res.data);
      setShowVerifyModal(false);
      setToastMessage('Prediction verified successfully.');
      setTimeout(() => {
        navigate('/flw/pending');
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    setIsSubmittingCorrection(true);
    try {
      const res = await correctPrediction(id, {
        verifiedBreed: selectedBreed,
        breedStatus: breedStatus,
        comment: comment,
        flwId: currentUser?.id,
        flwName: currentUser?.name
      });
      setAnalysis(res.data);
      setShowCorrectionForm(false);
      setToastMessage('Prediction corrected successfully.');
      setTimeout(() => {
        navigate('/flw/pending');
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCorrection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-sm font-medium text-slate-500">Loading review item...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-md py-16 text-left space-y-4">
        <p className="text-base font-semibold text-slate-800">Review record not found.</p>
        <button onClick={() => navigate('/flw/pending')} className="btn-primary">
          Back to Pending
        </button>
      </div>
    );
  }

  const factsheet = getBreedFactsheet(analysis.predictedBreed);

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <div className="card p-6 border-slate-200">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Review Livestock Case</h1>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Case ID: <span className="font-mono font-semibold">{analysis.id}</span> • Submitted by {analysis.userName || 'User'} on {analysis.date}
            </span>
          </div>
          <button
            onClick={() => navigate(`/flw/gradcam/${analysis.id}`)}
            className="btn-secondary text-xs px-3 py-1.5 self-start sm:self-auto flex items-center space-x-1.5"
          >
            <Icons.Eye className="w-3.5 h-3.5" />
            <span>View Grad-CAM Heatmap</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
          {/* Uploaded Image */}
          <div>
            <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
              <img
                src={analysis.imageUrl}
                alt={analysis.predictedBreed}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2.5 flex justify-between text-xs text-slate-600 px-1">
              <span>Specimen: <strong>{analysis.animalType}</strong></span>
              <span>Status: <strong>{analysis.breedStatus}</strong></span>
            </div>
          </div>

          {/* AI Prediction info */}
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl">
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">AI Model Prediction</div>
              <div className="text-2xl font-bold text-teal-950 mt-0.5">{analysis.predictedBreed}</div>
              <div className="text-xs font-semibold text-teal-700 mt-1">
                Confidence: {analysis.confidence}% • Status: {analysis.breedStatus}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Top 3 Predictions</div>
              <div className="space-y-1.5">
                {analysis.top3Predictions?.map((pred, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="font-medium text-slate-800">{index + 1}. {pred.breed}</span>
                    <span className="font-mono font-bold text-slate-700">{pred.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Morphological Reference Card for Field Worker */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Icons.BookOpen className="w-4 h-4 text-teal-700" />
            <span>Morphological Reference Standard ({factsheet.name})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {factsheet.morphologicalMarkers?.map((marker, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-emerald-800 block text-[11px]">{marker.part}:</span>
                <span className="text-slate-600 mt-0.5 block">{marker.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Decision Section */}
        {!showCorrectionForm ? (
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Is this prediction correct?
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setShowVerifyModal(true)}
                className="btn-primary px-6 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Prediction</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCorrectionForm(true)}
                className="btn-danger px-6 flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Correct Prediction</span>
              </button>
            </div>
          </div>
        ) : (
          /* Correction Form */
          <form onSubmit={handleSubmitCorrection} className="p-5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-4">
            <div className="flex justify-between items-center border-b border-blue-200/70 pb-2">
              <h2 className="text-base font-bold text-slate-900">Correct Prediction</h2>
              <button
                type="button"
                onClick={() => setShowCorrectionForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel Correction
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verified Breed
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {INDIAN_BREEDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={breedStatus}
                onChange={(e) => setBreedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pure">Pure</option>
                <option value="Crossbreed">Crossbreed</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Comment
              </label>
              <textarea
                rows="2"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add observational notes regarding characteristics, horns, dewlap, etc."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCorrectionForm(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingCorrection}
                className="btn-primary text-xs"
              >
                {isSubmittingCorrection ? 'Submitting...' : 'Submit Correction'}
              </button>
            </div>
          </form>
        )}

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/flw/pending')}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            ← Back to Pending Reviews
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Verification */}
      <ConfirmationModal
        isOpen={showVerifyModal}
        title="Confirm Verification"
        message="Confirm this prediction as verified?"
        confirmText="Confirm Verification"
        cancelText="Cancel"
        confirmVariant="primary"
        loading={isVerifying}
        onConfirm={handleConfirmVerification}
        onCancel={() => setShowVerifyModal(false)}
      />
    </div>
  );
}
