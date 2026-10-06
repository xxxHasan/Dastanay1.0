import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
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
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { User, ThemeMode } from '../types';
import { DastanayLogo } from './DastanayLogo';

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
  onOpenChat?: () => void;
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
  onOpenChat,
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
          {/* Zone 1: Official DASTANAY Wordmark Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="text-left group cursor-pointer focus:outline-none flex items-center"
              aria-label="DASTANAY Home"
            >
              <DastanayLogo height={26} />
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
            {[
              { id: 'home', label: 'Home' },
              { id: 'library', label: 'My Library' },
              ...(hasActivePack ? [{ id: 'pack_detail', label: 'Study Pack' }] : []),
              { id: 'quiz', label: 'Practice Quiz' },
              { id: 'flashcards', label: 'Flashcards' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`relative py-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                    isActive ? 'text-slate-900 dark:text-white font-semibold' : ''
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-desktop-nav-line"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 480, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
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

      {/* Mobile Sticky Bottom Navigation (Touch targets >= 44px with sliding active indicator) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg"
      >
        {[
          { id: 'home', label: 'Home', icon: BookOpen },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'create', label: 'Create', icon: PlusCircle, isPrimary: true },
          { id: 'quiz', label: 'Quiz', icon: Award },
          { id: 'settings', label: 'Profile', icon: Settings },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab('create')}
                className="relative flex flex-col items-center justify-center min-h-[46px] min-w-[56px] text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-xl px-3 py-1 shadow-xs cursor-pointer active:scale-95 transition-transform"
                aria-label="Create New Study Material"
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>Create</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[52px] text-[11px] font-medium cursor-pointer transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.label}</span>

              {isActive && (
                <motion.div
                  layoutId="active-mobile-nav-pill"
                  className="absolute inset-0 bg-indigo-50/90 dark:bg-indigo-950/70 rounded-xl -z-10 border border-indigo-200/80 dark:border-indigo-800/80"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
