import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ScanLine } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user | flw | admin
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ email, password, role });
      if (res.user.role === 'admin') {
        navigate('/admin/home');
      } else if (res.user.role === 'flw') {
        navigate('/flw/home');
      } else {
        navigate('/user/home');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick autofill demo buttons helper for convenient testing
  const handleQuickDemo = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'admin') {
      setEmail('admin@breedvision.ai');
      setPassword('password123');
    } else if (demoRole === 'flw') {
      setEmail('flw@example.com');
      setPassword('password123');
    } else {
      setEmail('ramesh@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white mx-auto mb-3 shadow-sm">
            <ScanLine className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">BreedVision AI</h1>
          <p className="text-xs text-slate-500 mt-1">
            Image-Based Breed Recognition for Cattle &amp; Buffaloes of India
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email / Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@example.com"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                  role === 'user'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setRole('flw')}
                className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                  role === 'flw'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                FLW
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                  role === 'admin'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-2.5 mt-2"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
          <Link to="/forgot-password" className="hover:text-emerald-600 font-medium">
            Forgot Password?
          </Link>
          <Link to="/register" className="hover:text-emerald-600 font-medium">
            Create Account
          </Link>
        </div>

        {/* Demo Fast Fill Assist */}
        <div className="mt-6 pt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 text-center">
          <div className="font-semibold text-slate-700 mb-1.5">Quick Demo Fill:</div>
          <div className="flex justify-center space-x-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
            >
              User Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('flw')}
              className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
            >
              FLW Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
