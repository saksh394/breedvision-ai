// src/pages/user/UserHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHistory, deleteAnalysis } from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Icons from '../../components/common/Icons';

export default function UserHistory() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      console.log('[History] fetching for user:', currentUser?.id);

      const data = await Promise.race([
        getHistory(currentUser?.id),
        new Promise((_, rej) => setTimeout(() => rej(new Error('History fetch timed out')), 15000))
      ]);

      console.log('[History] loaded', data.length, 'records');
      setHistory(data);
    } catch (err) {
      console.error('[History] fetch error:', err.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteAnalysis(deleteTargetId);
      setHistory(prev => prev.filter(item => item.id !== deleteTargetId));
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setToastMessage('Analysis deleted successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const tableHeaders = [
    { label: 'Image' },
    { label: 'Breed' },
    { label: 'Confidence' },
    { label: 'Status' },
    { label: 'Date' },
    { label: 'Actions', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">History</h1>
          <p className="text-xs text-slate-500 mt-0.5">Previous breed recognition analyses</p>
        </div>
        <button
          onClick={() => navigate('/user/upload')}
          className="btn-primary text-xs"
        >
          Analyze New Image
        </button>
      </div>

      {/* History Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading history...</div>
        ) : history.length === 0 ? (
          <EmptyState
            title="No history records found"
            message="You have not performed any image analyses yet."
            actionText="Upload Animal Image"
            onAction={() => navigate('/user/upload')}
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
                <td className="table-cell font-medium text-slate-800">
                  {item.confidence}%
                </td>
                <td className="table-cell">
                  <StatusBadge status={item.status} />
                </td>
                <td className="table-cell text-xs text-slate-500">
                  {item.date}
                </td>
                <td className="table-cell text-right space-x-1">
                  <button
                    onClick={() => setViewRecord(item)}
                    className="btn-ghost text-xs text-emerald-700 hover:text-emerald-900"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(item.id)}
                    className="btn-ghost text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Analysis"
        message="Are you sure you want to delete this analysis?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
        }}
      />

      {/* View Details Modal */}
      {viewRecord && (
        <Modal
          isOpen={true}
          title="Analysis Details"
          onClose={() => setViewRecord(null)}
          maxWidth="max-w-2xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <img
                src={viewRecord.imageUrl}
                alt={viewRecord.predictedBreed}
                className="w-full aspect-4/3 object-cover rounded-lg border border-slate-200"
              />
              <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
                <span>Type: <strong>{viewRecord.animalType}</strong></span>
                <span>Breed Status: <strong>{viewRecord.breedStatus}</strong></span>
              </div>
            </div>

            <div className="space-y-3">
              {/* AI Prediction */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Prediction</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {viewRecord.predictedBreed} — {viewRecord.confidence}%
                </div>
              </div>

              {/* FLW Verified Result */}
              <div className={`p-3 rounded-lg border ${
                viewRecord.status === 'Verified' ? 'bg-emerald-50/70 border-emerald-200' :
                viewRecord.status === 'Corrected' ? 'bg-teal-50/70 border-teal-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">FLW Verified Result</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {viewRecord.flwResult ? viewRecord.flwResult : 'Pending Verification'}
                </div>
                <div className="text-xs text-slate-600 mt-1 flex items-center space-x-2">
                  <span>Status:</span>
                  <StatusBadge status={viewRecord.status} />
                  {viewRecord.verifiedDate && <span>• {viewRecord.verifiedDate}</span>}
                </div>
                {viewRecord.flwComment && (
                  <div className="mt-2 text-xs text-slate-600 italic bg-white/70 p-2 rounded border border-slate-200/60">
                    "{viewRecord.flwComment}"
                  </div>
                )}
              </div>

              {/* Top 3 Predictions */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1 uppercase">Top 3 Candidates:</div>
                <div className="space-y-1">
                  {viewRecord.top3Predictions?.map((p, i) => (
                    <div key={i} className="text-xs flex justify-between bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      <span>{i + 1}. {p.breed}</span>
                      <span className="font-semibold">{p.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setViewRecord(null);
                navigate(`/user/gradcam/${viewRecord.id}`);
              }}
              className="btn-secondary text-xs"
            >
              View Grad-CAM
            </button>
            <button
              onClick={() => setViewRecord(null)}
              className="btn-primary text-xs"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
