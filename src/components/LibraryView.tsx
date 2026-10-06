import React, { useState, useEffect, useRef } from 'react';
import { 
  Library, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  PlusCircle, 
  BookOpen, 
  Award, 
  Layers, 
  Video,
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyPack, PDFExportSettings } from '../types';
import { downloadStudyGuide } from '../services/pdfGenerator';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface LibraryViewProps {
  packs: StudyPack[];
  onSelectPack: (pack: StudyPack) => void;
  onCreateNew: () => void;
  onDeletePack: (packId: string) => void;
  onRenamePack: (packId: string, newTitle: string) => void;
  onTryDemo?: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  packs,
  onSelectPack,
  onCreateNew,
  onDeletePack,
  onRenamePack,
  onTryDemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'pdfs' | 'quizzes' | 'flashcards' | 'youtube'>('all');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [packToDelete, setPackToDelete] = useState<StudyPack | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredPacks = packs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'notes') return p.chapters && p.chapters.length > 0;
    if (filterType === 'pdfs') return true;
    if (filterType === 'quizzes') return p.mcqs && p.mcqs.length > 0;
    if (filterType === 'flashcards') return p.flashcards && p.flashcards.length > 0;
    if (filterType === 'youtube') return p.sourceAttribution?.toLowerCase().includes('youtube');
    return true;
  });

  const handleStartRename = (p: StudyPack, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(p.id);
    setRenameInput(p.title);
  };

  const handleSaveRename = (packId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (renameInput.trim()) {
      onRenamePack(packId, renameInput.trim());
    }
    setRenamingId(null);
  };

  const handleDownload = (p: StudyPack, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSettings: PDFExportSettings = {
      style: 'modern',
      paper: 'a4',
      length: 'standard',
      language: 'English',
      includePageNumbers: true,
      includeToc: true,
      includeExecutiveSummary: true,
      includeChapterNotes: true,
      includeKeyIdeas: true,
      includeDefinitions: true,
      includeFormulas: true,
      includeQuestions: true,
      includeAnswers: true,
      includeMcqs: true,
      includeQuickRevision: true,
      includeCommonPitfalls: true,
    };
    downloadStudyGuide(p, defaultSettings);
  };

  const handleDeleteClick = (p: StudyPack, e: React.MouseEvent) => {
    e.stopPropagation();
    setPackToDelete(p);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>My Library</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your saved study materials, revision packs, and practice tests.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-xs cursor-pointer shrink-0 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Study Pack</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packs by title, topic, or subject... (Press /)"
            className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs (Segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'notes', label: 'Notes' },
            { id: 'pdfs', label: 'PDFs' },
            { id: 'quizzes', label: 'Quizzes' },
            { id: 'flashcards', label: 'Flashcards' },
            { id: 'youtube', label: 'YouTube' },
          ].map((f) => {
            const isActive = filterType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`relative px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{f.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-library-filter"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packs List / Grid */}
      {filteredPacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredPacks.map((p) => {
              const isEditing = renamingId === p.id;

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelectPack(p)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Top Line: Subject & Date */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-indigo-700 dark:text-indigo-400">{p.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.difficulty}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title & Rename input */}
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs border border-indigo-500 rounded bg-white dark:bg-slate-800 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleSaveRename(p.id, e)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setRenamingId(null); }}
                          className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {p.title}
                      </h3>
                    )}

                    {/* Summary snippet */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {p.summary}
                    </p>
                  </div>

                  {/* Footer Tools Count & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    {/* Tools count metadata */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      <span>{p.chapters?.length || 0} Ch</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.formulas?.length || 0} Formulas</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.mcqs?.length || 0} MCQs</span>
                    </div>

                    {/* Row Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleStartRename(p, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors"
                        title="Rename"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDownload(p, e)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded cursor-pointer transition-colors"
                        title="Download PDF Study Guide"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(p, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer transition-colors"
                        title="Delete Study Pack"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchQuery ? 'No matching study packs found.' : 'Your Library is ready for its first story.'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {searchQuery
                ? 'Try a different search query or clear the filter.'
                : 'Create a Study Pack from notes, PDFs, text, or a lecture.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <button
              onClick={onCreateNew}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Study Pack</span>
            </button>
            {onTryDemo && (
              <button
                onClick={onTryDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Try Demo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!packToDelete}
        title={packToDelete?.title || ''}
        itemType="study pack"
        onConfirm={() => {
          if (packToDelete) {
            onDeletePack(packToDelete.id);
            setPackToDelete(null);
          }
        }}
        onCancel={() => setPackToDelete(null)}
      />
    </div>
  );
};
