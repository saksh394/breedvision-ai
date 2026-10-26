import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { getAdminStats } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFlws: 0,
    totalAnalyses: 0,
    pendingReviews: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tableHeaders = [
    { label: 'Image' },
    { label: 'Prediction' },
    { label: 'Status' },
    { label: 'Date' },
    { label: 'Action', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Admin Home</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          System overview and core statistics
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center py-4 bg-slate-50/50">
          <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Users</div>
        </div>
        <div className="card text-center py-4 bg-teal-50/50 border-teal-200">
          <div className="text-2xl font-bold text-teal-700">{stats.totalFlws}</div>
          <div className="text-xs font-semibold text-teal-800 mt-1 uppercase tracking-wider">Total FLWs</div>
        </div>
        <div className="card text-center py-4 bg-emerald-50/50 border-emerald-200">
          <div className="text-2xl font-bold text-emerald-700">{stats.totalAnalyses}</div>
          <div className="text-xs font-semibold text-emerald-800 mt-1 uppercase tracking-wider">Total Analyses</div>
        </div>
        <div className="card text-center py-4 bg-amber-50/50 border-amber-200">
          <div className="text-2xl font-bold text-amber-700">{stats.pendingReviews}</div>
          <div className="text-xs font-semibold text-amber-800 mt-1 uppercase tracking-wider">Pending Reviews</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          <button
            onClick={() => navigate('/admin/feedback')}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            View Feedback Log →
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading system activity...</div>
        ) : stats.recentActivity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity recorded"
            message="Recent analyses and verification logs will appear here."
          />
        ) : (
          <Table headers={tableHeaders}>
            {stats.recentActivity.map((item) => (
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
                  <div className="text-xs text-slate-500">{item.confidence}% • {item.animalType}</div>
                </td>
                <td className="table-cell">
                  <StatusBadge status={item.status} />
                </td>
                <td className="table-cell text-xs text-slate-500">
                  {item.date}
                </td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => navigate(`/admin/feedback`)}
                    className="btn-ghost text-xs text-emerald-700 hover:text-emerald-900"
                  >
                    Inspect
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
