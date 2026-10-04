import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Trash2, 
  Check, 
  Sliders,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { UserPreferences, DifficultyLevel, PDFStyle, StudyPack, User as UserType, ThemeMode } from '../types';
import { applyTheme } from '../services/storage';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ProfileSettingsViewProps {
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onTryDemo: () => void;
  onClearLibrary: () => void;
  packs: StudyPack[];
  user?: UserType;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  preferences,
  onSavePreferences,
  onTryDemo,
  onClearLibrary,
  packs,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [formData, setFormData] = useState<UserPreferences>(preferences);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setFormData({ ...formData, theme: newTheme });
    applyTheme(newTheme);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(packs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DASTANAY_Study_Library_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isGuest = user?.isGuest ?? true;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Profile & Study Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your account credentials, study preferences, and application data.
        </p>
      </div>

      {/* Account Authentication Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {(user?.name || formData.name).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {user?.name || formData.name}
                </h3>
                {isGuest ? (
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded text-[10px] font-semibold">
                    Guest Scholar
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold">
                    Registered Member
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email || formData.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGuest ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Sign Up</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {isGuest && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>Guest mode active:</strong> You have instant access for hackathon evaluations. Create a permanent account to sync your study guides and notes across sessions.
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appearance & Theme Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Interface Theme</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Laptop },
            ].map((th) => {
              const Icon = th.icon;
              const isSelected = formData.theme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => handleThemeChange(th.id as ThemeMode)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Study Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Study & Generation Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Difficulty
              </label>
              <select
                value={formData.defaultDifficulty}
                onChange={(e) => setFormData({ ...formData, defaultDifficulty: e.target.value as DifficultyLevel })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Exam Focused">Exam Focused</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default PDF Style
              </label>
              <select
                value={formData.defaultPdfStyle}
                onChange={(e) => setFormData({ ...formData, defaultPdfStyle: e.target.value as PDFStyle })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              >
                <option value="modern">Modern (Clean & Highlighted)</option>
                <option value="academic">Academic (University Standard)</option>
                <option value="minimal">Minimal (Print Friendly)</option>
                <option value="notebook">Notebook (Lined & Warm)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={formData.prefersReducedMotion}
                onChange={(e) => setFormData({ ...formData, prefersReducedMotion: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Respect reduced motion (disable non-essential animations)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Management & Demo Tools
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Export study packs, explore demo sandbox, or clear your local storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Study Packs JSON</span>
            </button>

            <button
              type="button"
              onClick={onTryDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Launch Interactive Demo Sandbox</span>
            </button>

            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Clear Local Library</span>
            </button>
          </div>
        </div>
      </form>

      {/* Clear Library Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isClearModalOpen}
        title="Entire Local Study Library"
        itemType="library"
        onConfirm={() => {
          setIsClearModalOpen(false);
          onClearLibrary();
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
