// src/components/common/GradCamViewer.jsx
import React, { useState } from 'react';

export default function GradCamViewer({
  imageUrl,
  gradCamHeatmap,   // base64 data-URI for the raw jet heatmap
  gradCamOverlay,   // base64 data-URI for the heatmap blended over original
  predictedBreed = 'Gir',
  confidence = 78,
  onBack
}) {
  const [activeTab, setActiveTab] = useState('overlay'); // 'original' | 'heatmap' | 'overlay'
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);

  // Decide what src to show in the single <img> element
  const displaySrc = (() => {
    if (activeTab === 'original') return imageUrl;
    if (activeTab === 'heatmap')  return gradCamHeatmap || imageUrl;
    // overlay tab: prefer the backend-blended overlay; if unavailable fall back
    // to showing the original with a CSS heatmap layer (legacy behaviour)
    return gradCamOverlay || imageUrl;
  })();

  // Only show the legacy CSS gradient when we have no real overlay data
  const showLegacyGradient =
    (activeTab === 'heatmap' || activeTab === 'overlay') &&
    !gradCamHeatmap && !gradCamOverlay;

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Grad-CAM Explanation</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm font-semibold text-slate-700">{predictedBreed}</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-emerald-600 font-medium">{confidence}% Confidence</span>
          </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="btn-secondary text-xs">
            Back to Result
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4 bg-slate-100 p-1 rounded-lg">
        {['original', 'heatmap', 'overlay'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Image Display Area */}
      <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center mb-4 border border-slate-200">
        {displaySrc && (
          <img
            key={activeTab}  // remount so browser doesn't flicker on src swap
            src={displaySrc}
            alt={activeTab === 'original' ? 'Original' : activeTab === 'heatmap' ? 'Grad-CAM Heatmap' : 'Grad-CAM Overlay'}
            className="w-full h-full object-contain"
            style={
              // Overlay tab with real overlay image: respect the opacity slider
              activeTab === 'overlay' && gradCamOverlay
                ? { opacity: overlayOpacity }
                : undefined
            }
          />
        )}

        {/* Legacy CSS gradient fallback when no real heatmap data available */}
        {showLegacyGradient && (
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
              activeTab === 'heatmap' ? 'opacity-100 bg-slate-950' : ''
            }`}
            style={{
              opacity: activeTab === 'heatmap' ? 1 : overlayOpacity,
              background: activeTab === 'heatmap'
                ? 'radial-gradient(ellipse at 50% 45%, rgba(239, 68, 68, 0.95) 0%, rgba(234, 179, 8, 0.85) 30%, rgba(34, 197, 94, 0.6) 60%, rgba(59, 130, 246, 0.2) 80%, rgba(0, 0, 0, 0.9) 100%)'
                : 'radial-gradient(ellipse at 50% 45%, rgba(239, 68, 68, 0.9) 0%, rgba(234, 179, 8, 0.75) 30%, rgba(34, 197, 94, 0.5) 60%, transparent 80%)',
              mixBlendMode: activeTab === 'overlay' ? 'multiply' : 'normal'
            }}
          />
        )}
      </div>

      {/* Opacity slider — shown on Overlay tab only when we have a real overlay image */}
      {activeTab === 'overlay' && gradCamOverlay && (
        <div className="flex items-center justify-between mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-600 font-medium">Overlay Opacity:</span>
          <div className="flex items-center space-x-3 w-1/2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <span className="text-slate-700 font-mono w-8 text-right">
              {Math.round(overlayOpacity * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Short explanation strictly as specified */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 mb-6">
        Highlighted regions show areas that influenced the model prediction.
      </div>

      {/* Back Button */}
      {onBack && (
        <div className="flex justify-center">
          <button onClick={onBack} className="btn-primary w-full sm:w-auto">
            Back to Result
          </button>
        </div>
      )}
    </div>
  );
}
