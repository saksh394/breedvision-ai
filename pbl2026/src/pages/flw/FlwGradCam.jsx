// src/pages/flw/FlwGradCam.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReview } from '../../services/api';
import GradCamViewer from '../../components/common/GradCamViewer';

export default function FlwGradCam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getReview(id);
        setReview(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-sm font-medium text-slate-500">Loading Grad-CAM explanation...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-base font-semibold text-slate-800">Record not found.</p>
        <button onClick={() => navigate('/flw/pending')} className="btn-primary mt-4">
          Back to Pending
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <GradCamViewer
        imageUrl={review.imageUrl}
        gradCamHeatmap={review.gradCamHeatmap}
        gradCamOverlay={review.gradCamOverlay}
        predictedBreed={review.predictedBreed}
        confidence={review.confidence}
        onBack={() => navigate(`/flw/review/${review.id}`)}
      />
    </div>
  );
}
