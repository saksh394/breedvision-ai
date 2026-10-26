// src/pages/user/UserProfile.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/api';
import Icons from '../../components/common/Icons';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

export default function UserProfile() {
  const { currentUser, updateProfileState } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || 'Ramesh Patel');
  const [email, setEmail] = useState(currentUser?.email || 'ramesh@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [farmName, setFarmName] = useState(currentUser?.farmName || 'Patel Dairy & Livestock Farm');
  const [stateDistrict, setStateDistrict] = useState(currentUser?.stateDistrict || 'Gujarat, Anand District');
  const [village, setVillage] = useState(currentUser?.village || 'Boriavi');
  const [herdSize, setHerdSize] = useState(currentUser?.herdSize || '28 Animals');
  const [primaryBreeds, setPrimaryBreeds] = useState(currentUser?.primaryBreeds || 'Gir, Kankrej, Murrah Buffalo');

  // Password Form State
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
        farmName,
        stateDistrict,
        village,
        herdSize,
        primaryBreeds
      };
      const res = await updateUserProfile(currentUser?.id || 'u1', updatedData);
      if (res && res.user) {
        updateProfileState(res.user);
      }
      setIsEditing(false);
      setToastMessage('User profile updated successfully.');
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
      await updateUserProfile(currentUser?.id || 'u1', { password: newPassword });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMessage('Password updated successfully.');
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
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 text-2xl font-bold flex items-center justify-center border-2 border-emerald-300 shadow-xs">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                <span className="badge badge-verified">Livestock Owner / User</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Account ID: <span className="font-mono font-semibold text-slate-700">USR-IND-8921</span> • Member Since: <span className="text-slate-700 font-medium">10 Sep 2026</span>
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

        {/* Section 1: Personal & Contact Information */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.Profile className="w-4 h-4 text-emerald-700" />
            <span>Personal &amp; Contact Details</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Full Name</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{name}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Email Address</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block truncate">{email}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Mobile Number</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{phone}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Farm & Livestock Profile */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.MapPin className="w-4 h-4 text-emerald-700" />
            <span>Farm &amp; Livestock Profile</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Farm / Dairy Name</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{farmName}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">State &amp; District</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{stateDistrict}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Village / Taluka</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{village}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Herd Size</span>
              <span className="text-sm font-semibold text-emerald-700 mt-0.5 block">{herdSize}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Primary Reared Breeds</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{primaryBreeds}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Platform & Verification Summary */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.BarChart className="w-4 h-4 text-emerald-700" />
            <span>Platform Activity &amp; Status</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 text-center">
              <div className="text-xl font-bold text-emerald-800">14</div>
              <div className="text-[11px] font-semibold text-emerald-700 uppercase mt-0.5">Total Uploads</div>
            </div>
            <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 text-center">
              <div className="text-xl font-bold text-emerald-800">11</div>
              <div className="text-[11px] font-semibold text-emerald-700 uppercase mt-0.5">Verified by FLW</div>
            </div>
            <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200 text-center">
              <div className="text-xl font-bold text-amber-800">3</div>
              <div className="text-[11px] font-semibold text-amber-700 uppercase mt-0.5">Pending Review</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-xl font-bold text-slate-800">Active</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Account Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <Modal
          isOpen={true}
          title="Edit User Profile"
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
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Farm / Dairy Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State &amp; District</label>
                <input
                  type="text"
                  value={stateDistrict}
                  onChange={(e) => setStateDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Village / Taluka</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Herd Size</label>
                <input
                  type="text"
                  value={herdSize}
                  onChange={(e) => setHerdSize(e.target.value)}
                  placeholder="e.g. 28 Animals"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Breeds</label>
                <input
                  type="text"
                  value={primaryBreeds}
                  onChange={(e) => setPrimaryBreeds(e.target.value)}
                  placeholder="e.g. Gir, Murrah"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
                Save Profile Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <Modal
          isOpen={true}
          title="Change Account Password"
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
