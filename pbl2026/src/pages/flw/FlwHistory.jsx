import React, { useState, useEffect } from 'react';
import { getFlwHistory } from '../../services/api';
import { ClipboardList } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

export default function FlwHistory() {
  const [history, setHistory] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchHistoryData();
  }, [activeFilter]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const data = await getFlwHistory(activeFilter);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = ['All', 'Pending', 'Verified', 'Corrected'];

  const tableHeaders = [
    { label: 'Image' },
    { label: 'AI Prediction' },
    { label: 'FLW Result' },
    { label: 'Confidence' },
    { label: 'Status' },
    { label: 'Date' },
    { label: 'Action', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review History</h1>
          <p className="text-xs text-slate-500 mt-0.5">All verified, corrected, and pending animal cases</p>
        </div>

        {/* Filters */}
        <div className="flex bg-slate-100 p-1 rounded-lg space-x-1">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilter === filter
                  ? 'bg-white text-emerald-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading cases...</div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No records found"
            message={`No items matched the selected filter (${activeFilter}).`}
          />
        ) : (
          <Table headers={tableHeaders}>
            {history.map((item) => (
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
                <td className="table-cell">
                  {item.flwResult ? (
                    <span className="font-semibold text-slate-900">{item.flwResult}</span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="table-cell font-medium text-slate-800">
                  {item.confidence}%
                </td>
                <td className="table-cell">
                  <StatusBadge status={item.status} />
                </td>
                <td className="table-cell text-xs text-slate-500">
                  {item.date}
                </td>
                <td className="table-cell text-right">
                  <button
                    onClick={() => setSelectedItem(item)}
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

      {/* Modal */}
      {selectedItem && (
        <Modal
          isOpen={true}
          title="Case Details"
          onClose={() => setSelectedItem(null)}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.predictedBreed}
              className="w-full aspect-4/3 object-cover rounded-lg border border-slate-200"
            />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">AI Prediction:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedItem.predictedBreed} ({selectedItem.confidence}%)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">Status:</span>
                <span className="mt-1 inline-block"><StatusBadge status={selectedItem.status} /></span>
              </div>
            </div>

            {selectedItem.flwResult && (
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900 block mb-0.5">FLW Verified: {selectedItem.flwResult}</span>
                {selectedItem.flwComment && <p className="text-slate-700 italic">"{selectedItem.flwComment}"</p>}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={() => setSelectedItem(null)} className="btn-primary text-xs">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
