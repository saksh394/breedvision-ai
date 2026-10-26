// src/components/common/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-1.5 ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const renderNavLinks = () => {
    switch (currentUser.role) {
      case 'user':
        return (
          <>
            <NavLink to="/user/home" className={navItemClass}>
              <span>Home</span>
            </NavLink>
            <NavLink to="/user/upload" className={navItemClass}>
              <span>Upload Image</span>
            </NavLink>
            <NavLink to="/user/history" className={navItemClass}>
              <span>History</span>
            </NavLink>
            <NavLink to="/user/profile" className={navItemClass}>
              <span>Profile</span>
            </NavLink>
          </>
        );

      case 'flw':
        return (
          <>
            <NavLink to="/flw/home" className={navItemClass}>
              <span>Home</span>
            </NavLink>
            <NavLink to="/flw/pending" className={navItemClass}>
              <span>Pending Reviews</span>
            </NavLink>
            <NavLink to="/flw/verified" className={navItemClass}>
              <span>Verified</span>
            </NavLink>
            <NavLink to="/flw/history" className={navItemClass}>
              <span>History</span>
            </NavLink>
            <NavLink to="/flw/feedback" className={navItemClass}>
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/flw/profile" className={navItemClass}>
              <span>Profile</span>
            </NavLink>
          </>
        );

      case 'admin':
        return (
          <>
            <NavLink to="/admin/home" className={navItemClass}>
              <span>Home</span>
            </NavLink>
            <NavLink to="/admin/users" className={navItemClass}>
              <span>Users</span>
            </NavLink>
            <NavLink to="/admin/dataset" className={navItemClass}>
              <span>Dataset / Images</span>
            </NavLink>
            <NavLink to="/admin/model-testing" className={navItemClass}>
              <span>Model Testing</span>
            </NavLink>
            <NavLink to="/admin/feedback" className={navItemClass}>
              <span>Feedback</span>
            </NavLink>
            <NavLink to="/admin/reports" className={navItemClass}>
              <span>Reports</span>
            </NavLink>
            <NavLink to="/admin/profile" className={navItemClass}>
              <span>Profile</span>
            </NavLink>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {renderNavLinks()}
          </div>
          <button
            onClick={handleLogout}
            className="md:hidden text-xs font-medium text-slate-500 hover:text-red-600 px-2 py-1"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
