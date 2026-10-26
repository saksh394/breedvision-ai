// src/pages/user/UserGradCam.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalysis } from '../../services/api';
import GradCamViewer from '../../components/common/GradCamViewer';

export default function UserGradCam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-sm font-medium text-slate-500">Loading Grad-CAM explanation...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-base font-semibold text-slate-800">Analysis record not found.</p>
        <button onClick={() => navigate('/user/upload')} className="btn-primary mt-4">
          Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <GradCamViewer
        imageUrl={analysis.imageUrl}
        gradCamHeatmap={analysis.gradCamHeatmap}
        gradCamOverlay={analysis.gradCamOverlay}
        predictedBreed={analysis.predictedBreed}
        confidence={analysis.confidence}
        onBack={() => navigate(`/user/result/${analysis.id}`)}
      />
    </div>
  );
}
