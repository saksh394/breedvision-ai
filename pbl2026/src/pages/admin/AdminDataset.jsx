// src/pages/admin/AdminDataset.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getDatasetImages, uploadDatasetImage, updateDatasetLabel, deleteDatasetImage } from '../../services/api';
import { FolderArchive, UploadCloud, Plus } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const INDIAN_BREEDS = [
  'Gir',
  'Sahiwal',
  'Red Sindhi',
  'Tharparkar',
  'Kankrej',
  'Rathi',
  'Hariana',
  'Ongole',
  'Deoni',
  'Krishna Valley',
  'Hallikar',
  'Amritmahal',
  'Khillari',
  'Bargur',
  'Holstein Friesian',
  'Jersey',
  'Murrah',
  'Jaffarabadi',
  'Surti',
  'Mehsana',
  'Bhadawari',
  'Nili-Ravi',
  'Pandharpuri',
  'Toda'
];

export default function AdminDataset() {
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Upload Form State
  const [uploadBreed, setUploadBreed] = useState('Gir');
  const [uploadType, setUploadType] = useState('Cattle');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Edit Form State
  const [editingItem, setEditingItem] = useState(null);
  const [editBreed, setEditBreed] = useState('');
  const [editType, setEditType] = useState('Cattle');

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [toastMessage, setToastMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDataset();
  }, []);

  const fetchDataset = async () => {
    try {
      setLoading(true);
      const data = await getDatasetImages();
      setDataset(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const newItem = await uploadDatasetImage({
        breed: uploadBreed,
        type: uploadType,
        imageUrl: uploadPreview
      });
      setDataset(prev => [newItem, ...prev]);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setToastMessage('Image uploaded to dataset successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setActionLoading(true);
    try {
      const updated = await updateDatasetLabel(editingItem.id, editBreed, editType);
      setDataset(prev => prev.map(d => d.id === editingItem.id ? updated : d));
      setShowEditModal(false);
      setEditingItem(null);
      setToastMessage('Breed label updated successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setActionLoading(true);
    try {
      await deleteDatasetImage(deleteTargetId);
      setDataset(prev => prev.filter(d => d.id !== deleteTargetId));
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setToastMessage('Dataset image deleted successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const tableHeaders = [
    { label: 'Image' },
    { label: 'Breed' },
    { label: 'Type' },
    { label: 'Status' },
    { label: 'Actions', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dataset / Images</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ground-truth training and benchmark dataset repository
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary text-xs"
        >
          Upload Images
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading dataset...</div>
        ) : dataset.length === 0 ? (
          <EmptyState
            icon={FolderArchive}
            title="No dataset images found"
            message="Upload ground-truth animal photos to populate the database."
            actionText="Upload Images"
            onAction={() => setShowUploadModal(true)}
          />
        ) : (
          <Table headers={tableHeaders}>
            {dataset.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="table-cell">
                  <img
                    src={item.imageUrl}
                    alt={item.breed}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                </td>
                <td className="table-cell font-bold text-slate-900">
                  {item.breed}
                </td>
                <td className="table-cell text-xs text-slate-600">
                  {item.type}
                </td>
                <td className="table-cell">
                  <StatusBadge status={item.status} />
                </td>
                <td className="table-cell text-right space-x-1">
                  <button
                    onClick={() => setViewItem(item)}
                    className="btn-ghost text-xs text-slate-700 hover:text-slate-900"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setEditBreed(item.breed);
                      setEditType(item.type);
                      setShowEditModal(true);
                    }}
                    className="btn-ghost text-xs text-emerald-700 hover:text-emerald-900"
                  >
                    Edit Label
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTargetId(item.id);
                      setShowDeleteModal(true);
                    }}
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

      {/* Upload Images Modal */}
      {showUploadModal && (
        <Modal
          isOpen={true}
          title="Upload Dataset Image"
          onClose={() => setShowUploadModal(false)}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-6 text-center cursor-pointer bg-slate-50/50 flex flex-col items-center justify-center transition-colors"
            >
              {uploadPreview ? (
                <img src={uploadPreview} alt="Preview" className="w-full h-36 object-contain rounded" />
              ) : (
                <div>
                  <div className="w-10 h-10 mx-auto mb-2 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium">Select JPG/PNG Image</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Breed Label</label>
              <select
                value={uploadBreed}
                onChange={(e) => setUploadBreed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {INDIAN_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Animal Type</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Cattle">Cattle</option>
                <option value="Buffalo">Buffalo</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn-primary text-xs"
              >
                {actionLoading ? 'Uploading...' : 'Save to Dataset'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Breed Label Modal */}
      {showEditModal && editingItem && (
        <Modal
          isOpen={true}
          title="Edit Dataset Label"
          onClose={() => setShowEditModal(false)}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Breed</label>
              <select
                value={editBreed}
                onChange={(e) => setEditBreed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {INDIAN_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Animal Type</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Cattle">Cattle</option>
                <option value="Buffalo">Buffalo</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn-primary text-xs"
              >
                {actionLoading ? 'Saving...' : 'Update Label'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Modal */}
      {viewItem && (
        <Modal
          isOpen={true}
          title="Dataset Image"
          onClose={() => setViewItem(null)}
          maxWidth="max-w-md"
        >
          <img src={viewItem.imageUrl} alt={viewItem.breed} className="w-full aspect-4/3 object-cover rounded-lg border border-slate-200 mb-4" />
          <div className="text-sm font-semibold text-slate-900">{viewItem.breed} ({viewItem.type})</div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setViewItem(null)} className="btn-primary text-xs">Close</button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Dataset Image"
        message="Are you sure you want to delete this dataset image? This will permanently remove it from the training set."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
