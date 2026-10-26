import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { getPendingReviews } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';

export default function FlwPending() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getPendingReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Pending Reviews</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          User-uploaded images waiting for field verification
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading pending reviews...</div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No pending reviews"
            message="All image predictions are currently verified or reviewed."
          />
        ) : (
          <Table headers={tableHeaders}>
            {reviews.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="table-cell">
                  <img
                    src={item.imageUrl}
                    alt={item.predictedBreed}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
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
                    className="btn-primary text-xs py-1.5 px-3.5"
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
