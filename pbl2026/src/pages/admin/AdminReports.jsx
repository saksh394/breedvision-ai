// src/pages/admin/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { getReports } from '../../services/api';

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-sm font-medium text-slate-500">Loading system reports...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-6 border-b border-slate-200 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Operational statistics and model evaluation metrics
        </p>
      </div>

      {/* Case Distribution Summary */}
      <div className="card mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-4">Analysis Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <div className="text-2xl font-bold text-slate-900">{reports?.totalAnalyses || 0}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase">Total Analyses</div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
            <div className="text-2xl font-bold text-emerald-700">{reports?.verifiedCases || 0}</div>
            <div className="text-xs font-semibold text-emerald-800 mt-1 uppercase">Verified Cases</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <div className="text-2xl font-bold text-blue-700">{reports?.correctedCases || 0}</div>
            <div className="text-xs font-semibold text-blue-800 mt-1 uppercase">Corrected Cases</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
            <div className="text-2xl font-bold text-amber-700">{reports?.pendingCases || 0}</div>
            <div className="text-xs font-semibold text-amber-800 mt-1 uppercase">Pending Cases</div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Performance Metrics */}
      {reports?.metrics && (
        <div className="card">
          <h2 className="text-base font-bold text-slate-900 mb-4">Model Performance Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-900">{reports.metrics.accuracy}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase">Accuracy</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-900">{reports.metrics.precision}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase">Precision</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-900">{reports.metrics.recall}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase">Recall</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-900">{reports.metrics.f1Score}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase">F1 Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
