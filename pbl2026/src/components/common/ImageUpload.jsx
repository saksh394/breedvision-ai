// src/components/common/ImageUpload.jsx
import React, { useState, useRef } from 'react';
import Icons from './Icons';

export default function ImageUpload({
  onImageSelected,
  onAnalyze,
  previewUrl,
  onChangeImage,
  analyzing = false,
  error = null
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid JPG, JPEG, or PNG image.');
      return;
    }
    onImageSelected(file);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
      />

      {!previewUrl ? (
        /* Large Upload Area with Drag & Drop */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-600 bg-emerald-50/60 scale-[0.99]'
              : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30'
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xl shadow-xs">
            <span className="font-bold text-lg">↑</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-1">
            Drag &amp; Drop or Choose an image
          </p>
          <p className="text-xs text-slate-400 mb-5">
            JPG, JPEG, PNG
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="btn-primary text-xs px-5 py-2"
          >
            [ Browse Image ]
          </button>
        </div>
      ) : (
        /* Image Preview Area */
        <div className="space-y-6">
          <div className="w-full aspect-4/3 max-h-96 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm">
            <img
              src={previewUrl}
              alt="Animal Preview"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={onChangeImage}
              className="btn-secondary"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={onAnalyze}
              disabled={analyzing}
              className="btn-primary"
            >
              {analyzing ? 'Analyzing Image...' : 'Analyze Image'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
