import React, { useState, useEffect } from 'react';
import { getFlwFeedbackList } from '../../services/api';
import { MessageSquare } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';

export default function FlwFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const data = await getFlwFeedbackList();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tableHeaders = [
    { label: 'Image' },
    { label: 'AI Prediction' },
    { label: 'FLW Result' },
    { label: 'Feedback' },
    { label: 'Date', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Feedback Log</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review notes and breed corrections submitted during verification
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading feedback...</div>
        ) : feedbacks.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No feedback submissions yet"
            message="Worker feedback and notes will appear here."
          />
        ) : (
          <Table headers={tableHeaders}>
            {feedbacks.map((item) => (
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
                  <div className="text-xs text-slate-500">{item.confidence}% confidence</div>
                </td>
                <td className="table-cell">
                  <div className="font-bold text-emerald-800">
                    {item.flwResult || item.predictedBreed}
                  </div>
                  <span className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[11px] font-medium ${
                    item.status === 'Corrected' ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="table-cell max-w-xs text-xs text-slate-600">
                  {item.flwComment ? (
                    <span className="italic">"{item.flwComment}"</span>
                  ) : (
                    <span className="text-slate-400">No comment provided</span>
                  )}
                </td>
                <td className="table-cell text-xs text-slate-500 text-right">
                  {item.verifiedDate || item.date}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
