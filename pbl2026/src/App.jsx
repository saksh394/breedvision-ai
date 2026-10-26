// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Common Layout & Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AccessDenied from './components/common/AccessDenied';
import NotFound from './components/common/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// User Pages
import UserHome from './pages/user/UserHome';
import UserUpload from './pages/user/UserUpload';
import UserResult from './pages/user/UserResult';
import UserGradCam from './pages/user/UserGradCam';
import UserHistory from './pages/user/UserHistory';
import UserProfile from './pages/user/UserProfile';

// FLW Pages
import FlwHome from './pages/flw/FlwHome';
import FlwPending from './pages/flw/FlwPending';
import FlwReview from './pages/flw/FlwReview';
import FlwGradCam from './pages/flw/FlwGradCam';
import FlwVerified from './pages/flw/FlwVerified';
import FlwHistory from './pages/flw/FlwHistory';
import FlwFeedback from './pages/flw/FlwFeedback';
import FlwProfile from './pages/flw/FlwProfile';

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDataset from './pages/admin/AdminDataset';
import AdminModelTesting from './pages/admin/AdminModelTesting';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';

function RootRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin/home" replace />;
  if (currentUser.role === 'flw') return <Navigate to="/flw/home" replace />;
  return <Navigate to="/user/home" replace />;
}

function MainLayout() {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar for authenticated users */}
      {currentUser && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Body Container */}
      <div className={`flex-1 flex flex-col min-w-0 ${currentUser ? 'lg:pl-64' : ''}`}>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* USER Role Routes */}
            <Route
              path="/user/home"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/upload"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/result/:id"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/gradcam/:id"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserGradCam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/history"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* FLW Role Routes */}
            <Route
              path="/flw/home"
              element={
                <ProtectedRoute allowedRoles={['flw']}>
                  <FlwHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flw/pending"
              element={
                <ProtectedRoute allowedRoles={['flw']}>
                  <FlwPending />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flw/review/:id"
              element={
                <ProtectedRoute allowedRoles={['flw']}>
                  <FlwReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flw/gradcam/:id"
              element={
                <ProtectedRoute allowedRoles={['flw']}>
                  <FlwGradCam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flw/verified"
              element={
                <ProtectedRoute allowedRoles={['flw']}>
                  <FlwVerified />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flw/history"
              element={
                <ProtectedRoute allowedRoles={['flw']}>
                  <FlwHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flw/feedback"
              element={
                <ProtectedRoute allowedRoles={['flw']}>
                  <FlwFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flw/profile"
              element={
                <ProtectedRoute allowedRoles={['flw']}>
                  <FlwProfile />
                </ProtectedRoute>
              }
            />

            {/* ADMIN Role Routes */}
            <Route
              path="/admin/home"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dataset"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDataset />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dataset/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDataset />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/model-testing"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminModelTesting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFeedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            {/* Error & Fallback Routes */}
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
