// src/pages/flw/FlwProfile.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/api';
import Icons from '../../components/common/Icons';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

export default function FlwProfile() {
  const { currentUser, updateProfileState } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // FLW Professional Details State
  const [name, setName] = useState(currentUser?.name || 'Dr. Sunita Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'flw@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98234 56789');
  const [workerId, setWorkerId] = useState(currentUser?.workerId || 'FLW-IND-2026-084');
  const [designation, setDesignation] = useState(currentUser?.designation || 'Senior Livestock Extension Officer & Field Veterinarian');
  const [department, setDepartment] = useState(currentUser?.department || 'Department of Animal Husbandry & Dairying');
  const [assignedZone, setAssignedZone] = useState(currentUser?.assignedZone || 'Gujarat — Anand, Kheda & Vadodara Sector');
  const [verificationCenter, setVerificationCenter] = useState(currentUser?.verificationCenter || 'District Veterinary Polyclinic Center #4');
  const [licenseNumber, setLicenseNumber] = useState(currentUser?.licenseNumber || 'VET-IN-GJ-88312');

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
        workerId,
        designation,
        department,
        assignedZone,
        verificationCenter,
        licenseNumber
      };
      const res = await updateUserProfile(currentUser?.id || 'u2', updatedData);
      if (res && res.user) {
        updateProfileState(res.user);
      }
      setIsEditing(false);
      setToastMessage('Field worker credentials updated successfully.');
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
      await updateUserProfile(currentUser?.id || 'u2', { password: newPassword });
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
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 text-2xl font-bold flex items-center justify-center border-2 border-teal-300 shadow-xs">
              {name ? name.charAt(0).toUpperCase() : 'W'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                <span className="badge badge-corrected">Field-Level Worker (FLW)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Official ID: <span className="font-mono font-semibold text-slate-700">{workerId}</span> • License: <span className="text-slate-700 font-medium">{licenseNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary text-xs px-4 py-2"
            >
              Edit Credentials
            </button>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Section 1: Official Identification */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.BadgeCheck className="w-4 h-4 text-teal-700" />
            <span>Official Identity &amp; Designation</span>
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
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Official Mobile</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{phone}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Designation</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{designation}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Department / Agency</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{department}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Jurisdiction & Operational Center */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.MapPin className="w-4 h-4 text-teal-700" />
            <span>Assigned Jurisdiction &amp; Verification Center</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assigned Operating Zone</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{assignedZone}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Primary Verification Facility</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{verificationCenter}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Field Performance & Accuracy Metrics */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Icons.Activity className="w-4 h-4 text-teal-700" />
            <span>Field Verification Performance</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-teal-50/50 rounded-lg border border-teal-200 text-center">
              <div className="text-xl font-bold text-teal-800">148</div>
              <div className="text-[11px] font-semibold text-teal-700 uppercase mt-0.5">Total Cases Verified</div>
            </div>
            <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-200 text-center">
              <div className="text-xl font-bold text-emerald-800">96.2%</div>
              <div className="text-[11px] font-semibold text-emerald-700 uppercase mt-0.5">AI Agreement Rate</div>
            </div>
            <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 text-center">
              <div className="text-xl font-bold text-blue-800">6</div>
              <div className="text-[11px] font-semibold text-blue-700 uppercase mt-0.5">Corrections Submitted</div>
            </div>
            <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200 text-center">
              <div className="text-xl font-bold text-amber-800">&lt; 4h</div>
              <div className="text-[11px] font-semibold text-amber-700 uppercase mt-0.5">Avg Turnaround</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Credentials Modal */}
      {isEditing && (
        <Modal
          isOpen={true}
          title="Edit Worker Credentials"
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
                <label className="block font-semibold text-slate-700 mb-1">Worker ID / Badge</label>
                <input
                  type="text"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">License / Reg Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Zone</label>
                <input
                  type="text"
                  value={assignedZone}
                  onChange={(e) => setAssignedZone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verification Center</label>
                <input
                  type="text"
                  value={verificationCenter}
                  onChange={(e) => setVerificationCenter(e.target.value)}
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
                Save Credentials
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <Modal
          isOpen={true}
          title="Change Worker Password"
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
