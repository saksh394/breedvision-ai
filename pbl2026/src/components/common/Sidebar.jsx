// src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icons from './Icons';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-emerald-700 text-white font-semibold shadow-sm'
        : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
    }`;

  const renderNavLinks = () => {
    switch (currentUser.role) {
      case 'user':
        return (
          <>
            <NavLink to="/user/home" onClick={onClose} className={navItemClass}>
              <Icons.Home className="w-5 h-5 opacity-90" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/user/upload" onClick={onClose} className={navItemClass}>
              <Icons.Upload className="w-5 h-5 opacity-90" />
              <span>Upload Image</span>
            </NavLink>
            <NavLink to="/user/history" onClick={onClose} className={navItemClass}>
              <Icons.History className="w-5 h-5 opacity-90" />
              <span>History</span>
            </NavLink>
            <NavLink to="/user/profile" onClick={onClose} className={navItemClass}>
              <Icons.Profile className="w-5 h-5 opacity-90" />
              <span>Profile</span>
            </NavLink>
          </>
        );

      case 'flw':
        return (
          <>
            <NavLink to="/flw/home" onClick={onClose} className={navItemClass}>
              <Icons.Home className="w-5 h-5 opacity-90" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/flw/pending" onClick={onClose} className={navItemClass}>
              <Icons.Clock className="w-5 h-5 opacity-90" />
              <span>Pending Reviews</span>
            </NavLink>
            <NavLink to="/flw/verified" onClick={onClose} className={navItemClass}>
              <Icons.CheckCircle className="w-5 h-5 opacity-90" />
              <span>Verified</span>
            </NavLink>
            <NavLink to="/flw/history" onClick={onClose} className={navItemClass}>
              <Icons.History className="w-5 h-5 opacity-90" />
              <span>History</span>
            </NavLink>
            <NavLink to="/flw/feedback" onClick={onClose} className={navItemClass}>
              <Icons.Feedback className="w-5 h-5 opacity-90" />
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/flw/profile" onClick={onClose} className={navItemClass}>
              <Icons.Profile className="w-5 h-5 opacity-90" />
              <span>Profile</span>
            </NavLink>
          </>
        );

      case 'admin':
        return (
          <>
            <NavLink to="/admin/home" onClick={onClose} className={navItemClass}>
              <Icons.Home className="w-5 h-5 opacity-90" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/admin/users" onClick={onClose} className={navItemClass}>
              <Icons.Users className="w-5 h-5 opacity-90" />
              <span>Users</span>
            </NavLink>
            <NavLink to="/admin/dataset" onClick={onClose} className={navItemClass}>
              <Icons.Dataset className="w-5 h-5 opacity-90" />
              <span>Dataset / Images</span>
            </NavLink>
            <NavLink to="/admin/model-testing" onClick={onClose} className={navItemClass}>
              <Icons.ModelTest className="w-5 h-5 opacity-90" />
              <span>Model Testing</span>
            </NavLink>
            <NavLink to="/admin/feedback" onClick={onClose} className={navItemClass}>
              <Icons.Feedback className="w-5 h-5 opacity-90" />
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/admin/reports" onClick={onClose} className={navItemClass}>
              <Icons.Reports className="w-5 h-5 opacity-90" />
              <span>Reports</span>
            </NavLink>
            <NavLink to="/admin/profile" onClick={onClose} className={navItemClass}>
              <Icons.Profile className="w-5 h-5 opacity-90" />
              <span>Profile</span>
            </NavLink>
          </>
        );

      default:
        return null;
    }
  };

  const getRoleTitle = (role) => {
    if (role === 'admin') return 'Admin Portal';
    if (role === 'flw') return 'Field Worker Portal';
    return 'User Portal';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container with Forest-Green Agricultural AI Palette */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-emerald-900 text-white flex flex-col border-r border-emerald-950/40 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-emerald-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm border border-emerald-500/50">
              <Icons.Logo className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center space-x-1.5">
                <span>BreedVision AI</span>
              </div>
              <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">
                {getRoleTitle(currentUser.role)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-emerald-300 hover:text-white p-1"
          >
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {renderNavLinks()}
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-emerald-800/60 bg-emerald-950/30">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs border border-emerald-500 shadow-sm flex-shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser.role ? currentUser.role.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-300 capitalize font-medium">{currentUser.role === 'flw' ? 'Field Worker' : currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-800/60 hover:bg-red-700 text-emerald-100 hover:text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Icons.Logout className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
