import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGoHome = () => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role === 'admin') {
      navigate('/admin/home');
    } else if (currentUser.role === 'flw') {
      navigate('/flw/home');
    } else {
      navigate('/user/home');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center border border-slate-200">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested page does not exist or has been moved.
        </p>
        <button onClick={handleGoHome} className="btn-primary">
          Go to Home
        </button>
      </div>
    </div>
  );
}
