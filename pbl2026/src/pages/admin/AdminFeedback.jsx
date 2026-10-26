import React, { useState, useEffect } from 'react';
import { getAdminFeedback } from '../../services/api';
import { MessageSquare } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectItem, setInspectItem] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getAdminFeedback();
      setFeedbackList(data);
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
    { label: 'Status' },
    { label: 'Action', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Worker Feedback &amp; Corrections</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review corrections submitted by field workers to improve model datasets
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading feedback entries...</div>
        ) : feedbackList.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No worker feedback available"
            message="Feedback and correction logs will appear here."
          />
        ) : (
          <Table headers={tableHeaders}>
            {feedbackList.map((item) => (
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
                <td className="table-cell font-bold text-emerald-800">
                  {item.flwResult || item.predictedBreed}
                </td>
                <td className="table-cell">
                  <StatusBadge status={item.status} />
                </td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => setInspectItem(item)}
                    className="btn-ghost text-xs text-emerald-700 hover:text-emerald-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Detail Modal */}
      {inspectItem && (
        <Modal
          isOpen={true}
          title="Inspection Details"
          onClose={() => setInspectItem(null)}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <img src={inspectItem.imageUrl} alt={inspectItem.predictedBreed} className="w-full aspect-4/3 object-cover rounded-lg border border-slate-200" />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">AI Prediction:</span>
                <span className="font-bold text-slate-900 text-sm">{inspectItem.predictedBreed} ({inspectItem.confidence}%)</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                <span className="text-emerald-700 block">FLW Verified:</span>
                <span className="font-bold text-emerald-900 text-sm">{inspectItem.flwResult || inspectItem.predictedBreed}</span>
              </div>
            </div>

            {inspectItem.flwComment && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold block mb-0.5">Worker Note:</span>
                {inspectItem.flwComment}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={() => setInspectItem(null)} className="btn-primary text-xs">Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
