/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CreateView } from './components/CreateView';
import { AnalysisLoadingView } from './components/AnalysisLoadingView';
import { StudyPackDetailView } from './components/StudyPackDetailView';
import { QuizEngineView } from './components/QuizEngineView';
import { FlashcardEngineView } from './components/FlashcardEngineView';
import { LibraryView } from './components/LibraryView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { AuthModal } from './components/AuthModal';
import { 
  StudyPack, 
  MaterialType, 
  DifficultyLevel, 
  QuizAttempt, 
  UserPreferences,
  User,
  ThemeMode
} from './types';
import { DEMO_STUDY_PACK, DEMO_QUIZ_ATTEMPT } from './data/demoData';
import { 
  getStoredStudyPacks, 
  saveStudyPack, 
  deleteStudyPack, 
  renameStudyPack, 
  getStoredQuizAttempts, 
  saveQuizAttempt, 
  getStoredPreferences, 
  savePreferences, 
  clearAllLocalUserData,
  getAuthUser,
  logoutUser,
  getStoredTheme,
  applyTheme
} from './services/storage';
import { analyzeMaterial } from './services/api';
import { BookOpen, Sparkles, PlusCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  // Real library MUST be strictly empty for new users
  const [packs, setPacks] = useState<StudyPack[]>([]);
  const [activePack, setActivePack] = useState<StudyPack | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences());

  // Demo mode state - STRICTLY SEPARATE from user library
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Authentication state
  const [user, setUser] = useState<User>(getAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme());

  // Create Screen preselects
  const [createType, setCreateType] = useState<MaterialType>('pdf');
  const [createSubject, setCreateSubject] = useState<string>('Physics');

  // Loading state during AI generation
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingTitle, setAnalyzingTitle] = useState('');
  const [analyzingSubject, setAnalyzingSubject] = useState('');

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Initialize storage & theme
  useEffect(() => {
    const loadedPacks = getStoredStudyPacks();
    setPacks(loadedPacks);
    if (loadedPacks.length > 0) {
      setActivePack(loadedPacks[0]);
    } else {
      setActivePack(null);
    }
    const loadedAttempts = getStoredQuizAttempts();
    setAttempts(loadedAttempts);
    setPreferences(getStoredPreferences());
    setUser(getAuthUser());

    const savedTheme = getStoredTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Demo Action Trigger - NEVER writes to user library!
  const handleTryDemo = () => {
    setIsDemoMode(true);
    setActivePack(DEMO_STUDY_PACK);
    setActiveTab('pack_detail');
    showToast('Loaded interactive demo: Physics — Projectile Motion');
  };

  // Exit Demo Mode
  const handleExitDemo = () => {
    setIsDemoMode(false);
    const loadedPacks = getStoredStudyPacks();
    setActivePack(loadedPacks.length > 0 ? loadedPacks[0] : null);
    setActiveTab('library');
    showToast('Exited Demo Mode');
  };

  // Start Create from Home or Navbar
  const handleStartCreate = (preferredType: MaterialType = 'pdf', subject: string = 'Physics') => {
    if (isDemoMode) {
      setIsDemoMode(false);
    }
    setCreateType(preferredType);
    setCreateSubject(subject);
    setActiveTab('create');
  };

  // Handle Material Analysis Pipeline
  const handleAnalyzeMaterial = async (payload: {
    title: string;
    subject: string;
    difficulty: DifficultyLevel;
    content?: string;
    imageBase64?: string;
    imagesBase64?: string[];
    mimeType?: string;
    packOptions: Record<string, boolean>;
    sourceType: MaterialType;
    sourceName: string;
    quizQuestionCount: number;
  }) => {
    setAnalyzingTitle(payload.title);
    setAnalyzingSubject(payload.subject);
    setIsAnalyzing(true);

    try {
      const res = await analyzeMaterial({
        title: payload.title,
        subject: payload.subject,
        difficulty: payload.difficulty,
        content: payload.content,
        imageBase64: payload.imageBase64,
        imagesBase64: payload.imagesBase64,
        mimeType: payload.mimeType,
        packOptions: payload.packOptions,
        quizQuestionCount: payload.quizQuestionCount,
      });

      if (res.success && res.studyPack) {
        const newPack: StudyPack = {
          ...res.studyPack,
          sourceAttribution: `${payload.sourceName} · Generated by DASTANAY AI`,
        };

        saveStudyPack(newPack);
        const refreshedPacks = getStoredStudyPacks();
        setPacks(refreshedPacks);
        setActivePack(newPack);
        setIsDemoMode(false);
        setActiveTab('pack_detail');
        showToast(`Created study pack for ${newPack.title}`);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      showToast('Processing encountered an error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPack = (pack: StudyPack) => {
    setActivePack(pack);
    setIsDemoMode(!!pack.isDemo);
    setActiveTab('pack_detail');
  };

  const handleDeletePack = (packId: string) => {
    deleteStudyPack(packId);
    const refreshed = getStoredStudyPacks();
    setPacks(refreshed);
    if (activePack?.id === packId) {
      setActivePack(refreshed.length > 0 ? refreshed[0] : null);
    }
    showToast('Study pack permanently deleted');
  };

  const handleRenamePack = (packId: string, newTitle: string) => {
    renameStudyPack(packId, newTitle);
    const refreshed = getStoredStudyPacks();
    setPacks(refreshed);
    if (activePack?.id === packId) {
      setActivePack({ ...activePack, title: newTitle });
    }
    showToast('Renamed study pack');
  };

  const handleSaveAttempt = (attempt: QuizAttempt) => {
    if (!isDemoMode) {
      saveQuizAttempt(attempt);
      setAttempts(getStoredQuizAttempts());
    }
    showToast('Quiz results saved');
  };

  const handleSavePreferences = (prefs: UserPreferences) => {
    savePreferences(prefs);
    setPreferences(prefs);
    showToast('Preferences updated');
  };

  const handleClearLibrary = () => {
    clearAllLocalUserData();
    setPacks([]);
    if (!isDemoMode) {
      setActivePack(null);
    }
    showToast('Local study library cleared');
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setPreferences(getStoredPreferences());
    showToast(authenticatedUser.isGuest ? 'Continued in Guest Mode' : `Welcome back, ${authenticatedUser.name}!`);
  };

  const handleLogout = () => {
    logoutUser();
    const guestUser = getAuthUser();
    setUser(guestUser);
    showToast('Logged out. Switched to Guest Mode.');
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Find attempt for active pack if exists
  const activePackAttempt = activePack
    ? attempts.find((a) => a.packId === activePack.id) || (isDemoMode ? DEMO_QUIZ_ATTEMPT : null)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        onTryDemo={handleTryDemo}
        hasActivePack={!!activePack}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isDemoMode={isDemoMode}
        onExitDemo={handleExitDemo}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Loading Overlay Screen */}
        {isAnalyzing ? (
          <AnalysisLoadingView
            title={analyzingTitle}
            subject={analyzingSubject}
          />
        ) : (
          <>
            {/* 1. HOME VIEW */}
            {activeTab === 'home' && (
              <HomeView
                onStartCreate={handleStartCreate}
                onSelectPack={handleSelectPack}
                onExploreLibrary={() => setActiveTab('library')}
                onTryDemo={handleTryDemo}
                recentPacks={packs}
                userName={user.name.split(' ')[0] || 'Scholar'}
                isDemoActive={isDemoMode}
              />
            )}

            {/* 2. CREATE VIEW */}
            {activeTab === 'create' && (
              <CreateView
                initialType={createType}
                initialSubject={createSubject}
                onAnalyze={handleAnalyzeMaterial}
                onCancel={() => setActiveTab('home')}
              />
            )}

            {/* 3. STUDY PACK DETAIL VIEW */}
            {activeTab === 'pack_detail' && (
              activePack ? (
                <StudyPackDetailView
                  pack={activePack}
                  onStartQuiz={() => setActiveTab('quiz')}
                  onOpenFlashcards={() => setActiveTab('flashcards')}
                  onBack={() => setActiveTab('library')}
                  onDeletePack={handleDeletePack}
                  onRenamePack={handleRenamePack}
                  isDemoMode={isDemoMode}
                  onExitDemo={handleExitDemo}
                />
              ) : (
                <div className="max-w-md mx-auto py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">No Study Pack Selected</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Choose an existing pack from your library, generate a new one, or launch the interactive demo.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleStartCreate()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 rounded-lg cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 inline mr-1.5" />
                      <span>Create Pack</span>
                    </button>
                    <button
                      onClick={handleTryDemo}
                      className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 inline mr-1.5" />
                      <span>Try Demo</span>
                    </button>
                  </div>
                </div>
              )
            )}

            {/* 4. PRACTICE QUIZ VIEW */}
            {activeTab === 'quiz' && (
              activePack ? (
                <QuizEngineView
                  pack={activePack}
                  initialAttempt={activePackAttempt}
                  onSaveAttempt={handleSaveAttempt}
                  onBackToPack={() => setActiveTab('pack_detail')}
                />
              ) : (
                <div className="max-w-md mx-auto py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Select a Study Pack for Quiz</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Practice quizzes test comprehension of formulas, concepts, and multiple-choice questions from your study packs.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleStartCreate()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 rounded-lg cursor-pointer"
                    >
                      Create Pack
                    </button>
                    <button
                      onClick={handleTryDemo}
                      className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                    >
                      Try Physics Demo Quiz
                    </button>
                  </div>
                </div>
              )
            )}

            {/* 5. FLASHCARDS VIEW */}
            {activeTab === 'flashcards' && (
              activePack ? (
                <FlashcardEngineView
                  pack={activePack}
                  onBackToPack={() => setActiveTab('pack_detail')}
                />
              ) : (
                <div className="max-w-md mx-auto py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Select a Study Pack for Flashcards</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Flip through definitions and key formula cards to drill your memory.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleStartCreate()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 rounded-lg cursor-pointer"
                    >
                      Create Pack
                    </button>
                    <button
                      onClick={handleTryDemo}
                      className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                    >
                      Try Physics Demo Cards
                    </button>
                  </div>
                </div>
              )
            )}

            {/* 6. MY LIBRARY VIEW */}
            {activeTab === 'library' && (
              <LibraryView
                packs={packs}
                onSelectPack={handleSelectPack}
                onCreateNew={() => handleStartCreate()}
                onDeletePack={handleDeletePack}
                onRenamePack={handleRenamePack}
                onTryDemo={handleTryDemo}
              />
            )}

            {/* 7. SETTINGS / PROFILE VIEW */}
            {activeTab === 'settings' && (
              <ProfileSettingsView
                preferences={preferences}
                onSavePreferences={handleSavePreferences}
                onTryDemo={handleTryDemo}
                onClearLibrary={handleClearLibrary}
                packs={packs}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Floating Scannable Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
