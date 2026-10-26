// src/pages/user/UserHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHistory } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';

export default function UserHome() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await getHistory(currentUser?.id);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalAnalyses = history.length;
  const verifiedCount = history.filter(h => h.status === 'Verified' || h.status === 'Corrected').length;
  const pendingCount = history.filter(h => h.status === 'Pending' || h.status === 'Under Review').length;

  const recentAnalyses = history.slice(0, 4);

  const tableHeaders = [
    { label: 'Image' },
    { label: 'Breed' },
    { label: 'Confidence' },
    { label: 'Status' },
    { label: 'Action', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {currentUser?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of your animal breed analyses
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/user/upload')}
            className="btn-primary w-full sm:w-auto"
          >
            Analyze New Image
          </button>
        </div>
      </div>

      {/* Small Analysis Summary / Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-4 bg-slate-50/50">
          <div className="text-2xl font-bold text-slate-900">{totalAnalyses}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Analyses</div>
        </div>
        <div className="card text-center py-4 bg-emerald-50/50 border-emerald-200">
          <div className="text-2xl font-bold text-emerald-700">{verifiedCount}</div>
          <div className="text-xs font-semibold text-emerald-800 mt-1 uppercase tracking-wider">Verified</div>
        </div>
        <div className="card text-center py-4 bg-amber-50/50 border-amber-200">
          <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
          <div className="text-xs font-semibold text-amber-800 mt-1 uppercase tracking-wider">Pending</div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900">Recent Analyses</h2>
          {history.length > 0 && (
            <button
              onClick={() => navigate('/user/history')}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View All History →
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading recent analyses...</div>
        ) : recentAnalyses.length === 0 ? (
          <EmptyState
            title="No analyses yet"
            message="Upload an image of your cattle or buffalo to classify its breed."
            actionText="Analyze New Image"
            onAction={() => navigate('/user/upload')}
          />
        ) : (
          <Table headers={tableHeaders}>
            {recentAnalyses.map((item) => (
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
                <td className="table-cell">
                  <StatusBadge status={item.status} />
                </td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => navigate(`/user/result/${item.id}`)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Action Button at bottom as specified */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => navigate('/user/upload')}
          className="btn-primary px-6 py-2.5"
        >
          Analyze New Image
        </button>
      </div>
    </div>
  );
}
