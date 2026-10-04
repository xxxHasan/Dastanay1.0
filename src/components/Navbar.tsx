import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  PlusCircle, 
  Library, 
  Award, 
  Layers, 
  Settings, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronDown 
} from 'lucide-react';
import { User, ThemeMode } from '../types';

export type ActiveTab = 'home' | 'create' | 'library' | 'pack_detail' | 'quiz' | 'flashcards' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onTryDemo: () => void;
  hasActivePack?: boolean;
  user?: User;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isDemoMode?: boolean;
  onExitDemo?: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onTryDemo,
  hasActivePack = false,
  user,
  onOpenAuth,
  onLogout,
  isDemoMode = false,
  onExitDemo,
  theme = 'light',
  onToggleTheme,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Bar - Strictly complies with Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="text-left group cursor-pointer focus:outline-none"
              aria-label="DASTANAY Home"
            >
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                DASTANAY
              </span>
            </button>

            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <span>Demo Active</span>
              </span>
            )}
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer pb-0.5 border-b-2 ${
                activeTab === 'home' ? 'text-slate-900 dark:text-white border-indigo-600 font-semibold' : 'border-transparent'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer pb-0.5 border-b-2 ${
                activeTab === 'library' ? 'text-slate-900 dark:text-white border-indigo-600 font-semibold' : 'border-transparent'
              }`}
            >
              My Library
            </button>
            {hasActivePack && (
              <button
                onClick={() => setActiveTab('pack_detail')}
                className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer pb-0.5 border-b-2 ${
                  activeTab === 'pack_detail' ? 'text-slate-900 dark:text-white border-indigo-600 font-semibold' : 'border-transparent'
                }`}
              >
                Study Pack
              </button>
            )}
            <button
              onClick={() => setActiveTab('quiz')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer pb-0.5 border-b-2 ${
                activeTab === 'quiz' ? 'text-slate-900 dark:text-white border-indigo-600 font-semibold' : 'border-transparent'
              }`}
            >
              Practice Quiz
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer pb-0.5 border-b-2 ${
                activeTab === 'flashcards' ? 'text-slate-900 dark:text-white border-indigo-600 font-semibold' : 'border-transparent'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer pb-0.5 border-b-2 ${
                activeTab === 'settings' ? 'text-slate-900 dark:text-white border-indigo-600 font-semibold' : 'border-transparent'
              }`}
            >
              Settings
            </button>
          </nav>

          {/* Zone 3: Primary actions & User Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Demo Button / Exit Demo */}
            {isDemoMode ? (
              <button
                onClick={onExitDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
              >
                <span>Exit Demo</span>
              </button>
            ) : (
              <button
                onClick={onTryDemo}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                title="Instant demonstration with Physics — Projectile Motion"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Try Demo</span>
              </button>
            )}

            {/* Create Pack Button */}
            <button
              onClick={() => setActiveTab('create')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Pack</span>
            </button>

            {/* User Account / Auth Section */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                {user.isGuest ? (
                  <button
                    onClick={onOpenAuth}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                    title="Guest Mode: Click to log in or create an account"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Guest</span>
                    <span className="sm:hidden">Login</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline font-semibold max-w-[90px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}

                {/* Dropdown Menu for Authenticated Users */}
                {isUserMenuOpen && !user.isGuest && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account & Preferences</span>
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-800"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out (Switch to Guest)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation (Touch targets >= 44px) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] text-xs font-medium cursor-pointer transition-colors ${
            activeTab === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] text-xs font-medium cursor-pointer transition-colors ${
            activeTab === 'library' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Library className="w-5 h-5 mb-0.5" />
          <span>Library</span>
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className="flex flex-col items-center justify-center min-h-[48px] min-w-[64px] text-xs font-semibold text-white bg-slate-900 rounded-xl px-3 py-1 my-1 shadow-md cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 mb-0.5 text-indigo-300" />
          <span>Create</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] text-xs font-medium cursor-pointer transition-colors ${
            activeTab === 'quiz' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span>Quiz</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] text-xs font-medium cursor-pointer transition-colors ${
            activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
};
