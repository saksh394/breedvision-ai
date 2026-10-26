import React, { useState, useEffect, useRef } from 'react';
import { testModel, getModelMetrics } from '../../services/api';
import { FlaskConical, UploadCloud, Play } from 'lucide-react';
import GradCamViewer from '../../components/common/GradCamViewer';

export default function AdminModelTesting() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [showGradCam, setShowGradCam] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await getModelMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setShowGradCam(false);
  };

  const handleRunTest = async () => {
    if (!previewUrl) return;
    setTesting(true);
    try {
      const res = await testModel({ imageUrl: previewUrl, file: selectedFile });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-6 border-b border-slate-200 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Model Testing</h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform live inference tests and evaluate model performance metrics
        </p>
      </div>

      {/* Model Benchmark Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card text-center py-4 bg-emerald-50/50 border-emerald-200">
            <div className="text-xl font-bold text-emerald-700">{metrics.accuracy}</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Accuracy</div>
          </div>
          <div className="card text-center py-4 bg-slate-50 border-slate-200">
            <div className="text-xl font-bold text-slate-800">{metrics.precision}</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Precision</div>
          </div>
          <div className="card text-center py-4 bg-slate-50 border-slate-200">
            <div className="text-xl font-bold text-slate-800">{metrics.recall}</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Recall</div>
          </div>
          <div className="card text-center py-4 bg-slate-50 border-slate-200">
            <div className="text-xl font-bold text-slate-800">{metrics.f1Score}</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">F1 Score</div>
          </div>
        </div>
      )}

      {/* Testing Section */}
      <div className="card">
        <h2 className="text-base font-bold text-slate-900 mb-4">Run Live Inference Test</h2>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png"
          className="hidden"
        />

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 transition-colors flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 mb-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <FlaskConical className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-2">Choose test image</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="btn-primary text-xs"
            >
              Choose Image
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <div>
                <img
                  src={previewUrl}
                  alt="Test Subject"
                  className="w-full aspect-4/3 object-cover rounded-lg border border-slate-200"
                />
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                      setShowGradCam(false);
                    }}
                    className="btn-secondary text-xs flex-1"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={handleRunTest}
                    disabled={testing}
                    className="btn-primary text-xs flex-1"
                  >
                    {testing ? 'Testing...' : 'Test Model'}
                  </button>
                </div>
              </div>

              {/* Result Area */}
              <div>
                {testing ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    Running model inference pipeline...
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="text-xs font-semibold text-emerald-800 uppercase">Inference Output</div>
                      <div className="text-xl font-bold text-emerald-950 mt-1">{result.predictedBreed}</div>
                      <div className="text-xs font-semibold text-emerald-700 mt-0.5">Confidence: {result.confidence}%</div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1.5 uppercase">Top 3 Candidates</div>
                      <div className="space-y-1.5">
                        {result.top3Predictions.map((p, i) => (
                          <div key={i} className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                            <span className="font-medium text-slate-800">{i + 1}. {p.breed}</span>
                            <span className="font-bold text-slate-700">{p.confidence}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowGradCam(!showGradCam)}
                      className="btn-secondary text-xs w-full"
                    >
                      {showGradCam ? 'Hide Grad-CAM' : 'View Grad-CAM'}
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Click "Test Model" to process this image.
                  </div>
                )}
              </div>
            </div>

            {/* Inline Grad-Cam if toggled */}
            {showGradCam && result && (
              <div className="pt-6 border-t border-slate-200">
                <GradCamViewer
                  imageUrl={previewUrl}
                  gradCamHeatmap={result.gradCamHeatmap}
                  gradCamOverlay={result.gradCamOverlay}
                  predictedBreed={result.predictedBreed}
                  confidence={result.confidence}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
