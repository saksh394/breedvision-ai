// src/pages/admin/AdminProfile.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/api';
import Icons from '../../components/common/Icons';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

export default function AdminProfile() {
  const { currentUser, updateProfileState } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Admin Profile State
  const [name, setName] = useState(currentUser?.name || 'System Administrator');
  const [email, setEmail] = useState(currentUser?.email || 'admin@breedvision.ai');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 94000 11223');
  const [adminId, setAdminId] = useState(currentUser?.adminId || 'ADM-ROOT-001');
  const [organization, setOrganization] = useState(currentUser?.organization || 'National Livestock AI & Breeding Consortium');
  const [clearanceLevel, setClearanceLevel] = useState(currentUser?.clearanceLevel || 'Level 4 — Full System & Retraining Authority');
  const [twoFactorStatus, setTwoFactorStatus] = useState(currentUser?.twoFactorStatus || 'Enabled (TOTP & Biometric Key)');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const updatedData = {
        name,
        email,
        phone,
        adminId,
        organization,
        clearanceLevel,
        twoFactorStatus
      };
      const res = await updateUserProfile(currentUser?.id || 'u3', updatedData);
      if (res && res.user) {
        updateProfileState(res.user);
      }
      setIsEditing(false);
      setToastMessage('Administrator profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await updateUserProfile(currentUser?.id || 'u3', { password: newPassword });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMessage('Administrator password updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Top Banner Card */}
      <div className="card p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-800 text-2xl font-bold flex items-center justify-center border-2 border-purple-300 shadow-xs">
              {name ? name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                <span className="badge bg-purple-100 text-purple-800 border-purple-200">Super Administrator</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Admin UID: <span className="font-mono font-semibold text-slate-700">{adminId}</span> • 2FA Status: <span className="text-emerald-700 font-semibold">{twoFactorStatus}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary text-xs px-4 py-2"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Section 1: Administrator Credentials & Access */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.Shield className="w-4 h-4 text-purple-700" />
            <span>Administrator Credentials &amp; Access</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Administrator Name</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{name}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Admin Email</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block truncate">{email}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Direct Contact</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{phone}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Governing Organization</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{organization}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Access Clearance</span>
              <span className="text-sm font-semibold text-purple-800 mt-0.5 block">{clearanceLevel}</span>
            </div>
          </div>
        </div>

        {/* Section 2: AI Infrastructure & Model Parameters */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.ModelTest className="w-4 h-4 text-purple-700" />
            <span>AI Model &amp; System Infrastructure</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Production Model</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block font-mono">VisionTransformer-v2.4</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Deployment Cluster</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">FastAPI / PyTorch Cloud</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Last Model Audit</span>
              <span className="text-sm font-semibold text-emerald-700 mt-0.5 block">24 Sep 2026, 04:00 UTC</span>
            </div>
          </div>
        </div>

        {/* Section 3: Platform Scale & System Metrics */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.BarChart className="w-4 h-4 text-purple-700" />
            <span>Platform Governance &amp; Scale</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-purple-50/50 rounded-lg border border-purple-200 text-center">
              <div className="text-xl font-bold text-purple-800">16</div>
              <div className="text-[11px] font-semibold text-purple-700 uppercase mt-0.5">Total Accounts</div>
            </div>
            <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 text-center">
              <div className="text-xl font-bold text-emerald-800">5,420</div>
              <div className="text-[11px] font-semibold text-emerald-700 uppercase mt-0.5">Dataset Images</div>
            </div>
            <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 text-center">
              <div className="text-xl font-bold text-blue-800">92.4%</div>
              <div className="text-[11px] font-semibold text-blue-700 uppercase mt-0.5">Model Accuracy</div>
            </div>
            <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 text-center">
              <div className="text-xl font-bold text-emerald-800">99.98%</div>
              <div className="text-[11px] font-semibold text-emerald-700 uppercase mt-0.5">Inference Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <Modal
          isOpen={true}
          title="Edit Administrator Profile"
          onClose={() => { setIsEditing(false); setError(''); }}
          maxWidth="max-w-xl"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrator Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Direct Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin UID</label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Governing Organization</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs">
                Save Administrator Profile
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <Modal
          isOpen={true}
          title="Change Administrator Password"
          onClose={() => { setIsChangingPassword(false); setError(''); }}
          maxWidth="max-w-md"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs">
                Update Password
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
