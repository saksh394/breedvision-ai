import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { getHistory, getPendingReviews } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';

export default function FlwHome() {
  const navigate = useNavigate();

  const [pendingReviews, setPendingReviews] = useState([]);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlwHomeData();
  }, []);

  const fetchFlwHomeData = async () => {
    try {
      setLoading(true);
      // allSettled: one slow/failed request must not block the other
      const [pendingRes, allRes] = await Promise.allSettled([
        getPendingReviews(),
        getHistory()
      ]);
      setPendingReviews(pendingRes.status === 'fulfilled' ? pendingRes.value : []);
      setAllAnalyses(allRes.status === 'fulfilled' ? allRes.value : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = pendingReviews.length;
  const verifiedCount = allAnalyses.filter(a => a.status === 'Verified' || a.status === 'Corrected').length;
  const totalReviewed = verifiedCount;

  const recentPending = pendingReviews.slice(0, 5);

  const tableHeaders = [
    { label: 'Image' },
    { label: 'AI Prediction' },
    { label: 'Confidence' },
    { label: 'Date' },
    { label: 'Status' },
    { label: 'Action', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">
          Field Worker Home
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review and verify field breed predictions
        </p>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-4 bg-amber-50/50 border-amber-200">
          <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
          <div className="text-xs font-semibold text-amber-800 mt-1 uppercase tracking-wider">Pending Reviews</div>
        </div>
        <div className="card text-center py-4 bg-emerald-50/50 border-emerald-200">
          <div className="text-2xl font-bold text-emerald-700">{verifiedCount}</div>
          <div className="text-xs font-semibold text-emerald-800 mt-1 uppercase tracking-wider">Verified</div>
        </div>
        <div className="card text-center py-4 bg-slate-50/50">
          <div className="text-2xl font-bold text-slate-900">{totalReviewed}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Reviewed</div>
        </div>
      </div>

      {/* Recent Pending Reviews */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900">Recent Pending Reviews</h2>
          {pendingReviews.length > 0 && (
            <button
              onClick={() => navigate('/flw/pending')}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View All Pending ({pendingCount}) →
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading pending reviews...</div>
        ) : recentPending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No pending reviews"
            message="All user image submissions have been reviewed."
          />
        ) : (
          <Table headers={tableHeaders}>
            {recentPending.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="table-cell">
                  <img
                    src={item.imageUrl}
                    alt={item.predictedBreed}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                  />
                </td>
                <td className="table-cell">
                  <div className="font-semibold text-slate-900">{item.predictedBreed}</div>
                  <div className="text-xs text-slate-500">{item.animalType}</div>
                </td>
                <td className="table-cell font-medium text-slate-800">
                  {item.confidence}%
                </td>
                <td className="table-cell text-xs text-slate-500">
                  {item.date}
                </td>
                <td className="table-cell">
                  <StatusBadge status={item.status} />
                </td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => navigate(`/flw/review/${item.id}`)}
                    className="btn-primary text-xs py-1 px-3"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
