// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
              <p className="font-semibold mb-1">Reset link sent!</p>
              <p>
                We have sent password reset instructions to <strong>{email}</strong>.
              </p>
            </div>
            <div className="text-center">
              <Link to="/reset-password" className="text-xs text-emerald-600 hover:underline font-medium block mb-2">
                Proceed to Reset Password Page →
              </Link>
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-700">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@example.com"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 mt-2"
            >
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-700">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
