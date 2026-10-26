// src/components/common/Header.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Icons from './Icons';

export default function Header({ onToggleSidebar }) {
  const { currentUser } = useAuth();
  const { currentLang, changeLanguage, languages, t } = useLanguage();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-medium border border-purple-200">{t('roleAdmin')}</span>;
      case 'flw':
        return <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-medium border border-teal-200">{t('roleFlw')}</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">{t('roleUser')}</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {currentUser && onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <Icons.Menu className="w-6 h-6" />
              </button>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">{t('appTitle')}</span>
                {currentUser && getRoleBadge(currentUser.role)}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Indic Language Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Icons.Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={currentLang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="text-xs font-semibold bg-transparent text-slate-700 border-none outline-none cursor-pointer focus:ring-0"
                title="Select Interface Language"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {currentUser && (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900">{currentUser.name}</div>
                </div>
                <div
                  className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm border shadow-sm ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : currentUser.role === 'flw'
                      ? 'bg-teal-100 text-teal-800 border-teal-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                  title={`${currentUser.name} (${currentUser.role?.toUpperCase()})`}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser.role ? currentUser.role.charAt(0).toUpperCase() : 'U')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
