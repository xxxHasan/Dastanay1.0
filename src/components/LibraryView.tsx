import React, { useState } from 'react';
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

  const filteredPacks = packs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'notes') return p.chapters.length > 0;
    if (filterType === 'pdfs') return true; // all packs have PDF guide
    if (filterType === 'quizzes') return p.mcqs.length > 0;
    if (filterType === 'flashcards') return p.flashcards.length > 0;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-600" />
            <span>My Library</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            All your generated notes, quizzes, flashcards, and printable PDF guides.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Study Pack</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packs by title, topic, or subject..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs (Segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'notes', label: 'Notes' },
            { id: 'pdfs', label: 'PDFs' },
            { id: 'quizzes', label: 'Quizzes' },
            { id: 'flashcards', label: 'Flashcards' },
            { id: 'youtube', label: 'YouTube' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterType === f.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Packs List / Grid */}
      {filteredPacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPacks.map((p) => {
            const isEditing = renamingId === p.id;

            return (
              <div
                key={p.id}
                onClick={() => onSelectPack(p)}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Line: Subject & Date (Unboxed metadata with middle dot) */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-700">{p.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.difficulty}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
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
                        className="flex-1 px-2.5 py-1 text-xs border border-indigo-500 rounded bg-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleSaveRename(p.id, e)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenamingId(null); }}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {p.title}
                    </h3>
                  )}

                  {/* Summary snippet */}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {p.summary}
                  </p>
                </div>

                {/* Footer Tools Count & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* Tools unboxed pills */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{p.chapters.length} Ch</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.formulas.length} Formulas</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.mcqs.length} MCQs</span>
                  </div>

                  {/* Row Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleStartRename(p, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                      title="Rename"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(p, e)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                      title="Download PDF Study Guide"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(p, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Delete Study Pack"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your study library is empty.</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create your first study pack from a document, lecture, image or text.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <button
              onClick={onCreateNew}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Study Pack</span>
            </button>
            {onTryDemo && (
              <button
                onClick={onTryDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
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
