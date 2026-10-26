import React, { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, deleteUser } from '../../services/api';
import { Users } from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsersList();
  }, []);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Deactivated' : 'Active';
    try {
      await updateUserStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      setToastMessage(`User ${user.name} marked as ${newStatus}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setActionLoading(true);
    try {
      await deleteUser(deleteTargetId);
      setUsers(prev => prev.filter(u => u.id !== deleteTargetId));
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setToastMessage('User deleted successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const tableHeaders = [
    { label: 'Name' },
    { label: 'Email' },
    { label: 'Role' },
    { label: 'Status' },
    { label: 'Actions', align: 'right' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage system users, workers, and access permissions
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading user directory...</div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No registered users found"
            message="User profiles will appear here once registered."
          />
        ) : (
          <Table headers={tableHeaders}>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="table-cell font-medium text-slate-900">
                  {u.name}
                </td>
                <td className="table-cell text-xs text-slate-600">
                  {u.email}
                </td>
                <td className="table-cell">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'flw' ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {u.role === 'flw' ? 'Field Worker' : u.role}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    u.status === 'Active' ? 'badge-verified' : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {u.status || 'Active'}
                  </span>
                </td>
                <td className="table-cell text-right space-x-1">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="btn-ghost text-xs text-slate-700 hover:text-slate-900"
                  >
                    View
                  </button>
                  {u.status === 'Active' ? (
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className="btn-ghost text-xs text-amber-600 hover:text-amber-800"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className="btn-ghost text-xs text-emerald-600 hover:text-emerald-800"
                    >
                      Activate
                    </button>
                  )}
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => {
                        setDeleteTargetId(u.id);
                        setShowDeleteModal(true);
                      }}
                      className="btn-ghost text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Delete User Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete User"
        message="Are you sure you want to permanently delete this user account? This cannot be undone."
        confirmText="Delete User"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
        }}
      />

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={true}
          title="User Profile"
          onClose={() => setSelectedUser(null)}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-sm">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block">Name</span>
              <span className="font-semibold text-slate-900">{selectedUser.name}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block">Email</span>
              <span className="font-semibold text-slate-900">{selectedUser.email}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-xs text-slate-500 block">Role</span>
                <span className="font-semibold capitalize text-slate-900">{selectedUser.role}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-xs text-slate-500 block">Status</span>
                <span className="font-semibold text-emerald-600">{selectedUser.status || 'Active'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={() => setSelectedUser(null)} className="btn-primary text-xs">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
