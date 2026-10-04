import React from 'react';
import { 
  FileText, 
  Camera, 
  Video, 
  PenTool, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { StudyPack, MaterialType } from '../types';

interface HomeViewProps {
  onStartCreate: (preferredType?: MaterialType, subject?: string) => void;
  onSelectPack: (pack: StudyPack) => void;
  onExploreLibrary: () => void;
  onTryDemo: () => void;
  recentPacks: StudyPack[];
  userName?: string;
  isDemoActive?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartCreate,
  onSelectPack,
  onExploreLibrary,
  onTryDemo,
  recentPacks,
  userName = 'Student',
  isDemoActive = false,
}) => {
  const hasUserPacks = recentPacks.length > 0;
  const primaryPack = hasUserPacks ? recentPacks[0] : null;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="pt-6 sm:pt-10 pb-4 text-center max-w-3xl mx-auto px-4">
        {/* Editorial Pill Tag */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-sm">
            AI Study Companion
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <button
            onClick={onTryDemo}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-4 cursor-pointer transition-colors"
          >
            Launch Interactive Demo (Physics)
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white text-balance leading-tight">
          Turn Learning Into a Story.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload your notes, scan with camera, or paste a YouTube video. DASTANAY transforms raw educational material into structured notes, quizzes, and downloadable study guides.
        </p>

        {/* Primary & Secondary Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onStartCreate('pdf')}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Study Material</span>
          </button>

          <button
            onClick={onExploreLibrary}
            className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>My Library ({recentPacks.length})</span>
          </button>

          <button
            onClick={onTryDemo}
            className="inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Try Demo</span>
          </button>
        </div>
      </section>

      {/* What are you learning today? 4 Core Avenues */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">What are you learning today?</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Select any input avenue to begin</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onStartCreate('pdf')}
            className="text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Upload Notes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload textbook chapters, lecture slides, syllabus papers, or research docs (PDF, DOCX).
            </p>
          </button>

          <button
            onClick={() => onStartCreate('camera')}
            className="text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Scan Notes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Snap multi-page photos of notebooks, whiteboard formulas, or worksheets with your camera.
            </p>
          </button>

          <button
            onClick={() => onStartCreate('youtube')}
            className="text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Learn from YouTube
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste educational lecture URLs to extract concepts, formulas, and timestamped notes.
            </p>
          </button>

          <button
            onClick={() => onStartCreate('text')}
            className="text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <PenTool className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Paste Text
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste raw lecture notes, article excerpts, syllabus outlines, or essay drafts directly.
            </p>
          </button>
        </div>
      </section>

      {/* Continue Learning Card - ONLY IF USER HAS REAL PACKS */}
      {hasUserPacks && primaryPack ? (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                Recent Study Pack
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {primaryPack.title}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">{primaryPack.subject}</span>
                <span aria-hidden="true">·</span>
                <span>{primaryPack.difficulty}</span>
                <span aria-hidden="true">·</span>
                <span>{primaryPack.chapters.length} Chapters</span>
                <span aria-hidden="true">·</span>
                <span>{primaryPack.mcqs.length} MCQs</span>
              </div>
            </div>

            <button
              onClick={() => onSelectPack(primaryPack)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer self-start md:self-auto"
            >
              <span>Open Study Pack</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      ) : (
        /* Empty Library Hint */
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-5xl mx-auto text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your study library is empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Create your first study pack from a document, lecture, image or text to begin your collection.
            </p>
          </div>
          <button
            onClick={() => onStartCreate('pdf')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Study Pack</span>
          </button>
        </section>
      )}

      {/* Value Pillars */}
      <section className="max-w-5xl mx-auto px-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">One source. Everything you need.</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">DASTANAY turns raw material into review-ready learning tools</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Structured Notes</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Clear concept hierarchies, definition blocks, formula variables, and concrete examples.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-2">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Multi-Page Scanner</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Capture multiple whiteboard diagrams or notebook pages into a single cohesive study pack.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-2">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lecture Transcripts</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Preserve lecture timestamps to link study formulas and concepts directly to lecture moments.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Printable Study PDFs</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Download formatted study guides with covers, table of contents, and 5-minute revision sheets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
