import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Award, 
  Download, 
  Share2, 
  Clock, 
  Check, 
  ChevronRight,
  Calculator,
  Bookmark,
  AlertTriangle
} from 'lucide-react';
import { StudyPack, PDFExportSettings } from '../types';
import { downloadStudyGuide } from '../services/pdfGenerator';
import { PDFPreviewModal } from './PDFPreviewModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Trash2, Edit3, MoreHorizontal, MessageSquare } from 'lucide-react';

interface StudyPackDetailViewProps {
  pack: StudyPack;
  onStartQuiz: () => void;
  onOpenFlashcards: () => void;
  onBack: () => void;
  onDeletePack?: (packId: string) => void;
  onRenamePack?: (packId: string, newTitle: string) => void;
  isDemoMode?: boolean;
  onExitDemo?: () => void;
  onOpenChat?: () => void;
}

export const StudyPackDetailView: React.FC<StudyPackDetailViewProps> = ({
  pack,
  onStartQuiz,
  onOpenFlashcards,
  onBack,
  onDeletePack,
  onRenamePack,
  isDemoMode = false,
  onExitDemo,
  onOpenChat,
}) => {
  type DetailTab = 'notes' | 'summary' | 'formulas' | 'questions' | 'revision';
  const [activeTab, setActiveTab] = useState<DetailTab>('notes');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(pack.title);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleShare = () => {
    // Generate share link
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveRename = () => {
    if (newTitle.trim() && onRenamePack) {
      onRenamePack(pack.id, newTitle.trim());
      setIsRenaming(false);
    }
  };

  const handleQuickDownload = () => {
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
    downloadStudyGuide(pack, defaultSettings);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Demo Mode Banner (isolated from library) */}
      {isDemoMode && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse shrink-0" />
            <span>
              <strong>Demo Mode:</strong> You are exploring "Physics — Projectile Motion". This sample dataset is completely isolated and is not saved to your library.
            </span>
          </div>
          {onExitDemo && (
            <button
              onClick={onExitDemo}
              className="px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shrink-0 transition-colors"
            >
              Exit Demo Mode
            </button>
          )}
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer mb-1 inline-flex items-center gap-1"
          >
            ← Back to Library
          </button>

          {isRenaming ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-lg sm:text-xl font-bold px-2 py-1 border border-indigo-500 rounded bg-white focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveRename}
                className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => { setIsRenaming(false); setNewTitle(pack.title); }}
                className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {pack.title}
              </h1>
              {!isDemoMode && onRenamePack && (
                <button
                  onClick={() => setIsRenaming(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                  title="Rename Study Pack"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-indigo-700">{pack.subject}</span>
            <span aria-hidden="true">·</span>
            <span>{pack.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>{new Date(pack.createdAt).toLocaleDateString()}</span>
            {pack.sourceAttribution && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400 truncate max-w-xs">{pack.sourceAttribution}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
              title="Open Study Chat for this pack"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask DASTANAY</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            title="Share study pack link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Link' : 'Share'}</span>
          </button>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Study PDF</span>
          </button>

          {!isDemoMode && onDeletePack && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Delete Study Pack"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Launch Cards for Interactive Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Practice Quiz ({pack.mcqs.length} Questions)</span>
            </div>
            <p className="text-xs text-slate-500">
              Diagnostic test with weakness detection & revision scheduling.
            </p>
          </div>
          <button
            onClick={onStartQuiz}
            className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap ml-3"
          >
            Start Quiz
          </button>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Flashcards ({pack.flashcards.length} Cards)</span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive flip cards with mastery filtering and shuffle.
            </p>
          </div>
          <button
            onClick={onOpenFlashcards}
            className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap ml-3"
          >
            Practice Cards
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs (Segmented Control) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'notes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Smart Notes
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          5-Minute Summary
        </button>
        <button
          onClick={() => setActiveTab('formulas')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'formulas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Formulas & Definitions ({pack.formulas.length + pack.definitions.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'questions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Important Questions ({pack.questions.length})
        </button>
        <button
          onClick={() => setActiveTab('revision')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'revision' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Revision Sheet
        </button>
      </div>

      {/* Tab 1: Smart Notes Content */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {pack.chapters.map((chap) => (
            <article
              key={chap.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Chapter {chap.chapterNumber}: {chap.chapterTitle}
                </h2>
                {chap.sourceCitation && (
                  <span className="text-xs text-slate-400 font-mono">
                    {chap.sourceCitation}
                  </span>
                )}
              </div>

              {/* 1. Main Concept */}
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Main Concept
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {chap.mainConcept}
                </p>
              </div>

              {/* Key Idea Block */}
              <div className="p-4 bg-indigo-50/50 border-l-4 border-indigo-600 rounded-r-lg space-y-1">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                  Key Idea
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {chap.keyIdea}
                </p>
              </div>

              {/* Remember Callout */}
              <div className="flex items-start gap-2.5 p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 mr-1.5">Remember:</span>
                  <span className="text-amber-950/80 leading-relaxed">{chap.remember}</span>
                </div>
              </div>

              {/* Example Box */}
              {chap.example && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">Example:</span>
                  <p className="text-slate-600 italic leading-relaxed">{chap.example}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Tab 2: 5-Minute Summary */}
      {activeTab === 'summary' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
              What do I need to remember if I only have 5 minutes?
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Executive Summary
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
            {pack.summary}
          </p>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Essential Takeaways
            </h3>
            <ul className="space-y-2">
              {pack.revisionSheet.quickTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Formulas & Definitions */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          {/* Formulas */}
          {pack.formulas.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>Important Formulas & Mathematical Laws</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pack.formulas.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{f.name}</span>
                      {f.sourceCitation && (
                        <span className="text-[10px] text-slate-400 font-mono">{f.sourceCitation}</span>
                      )}
                    </div>

                    {/* Exact Formula Presentation Box */}
                    <div className="py-2.5 px-3 bg-white border border-slate-200 rounded text-center font-mono text-sm font-bold text-indigo-950">
                      {f.formula}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {f.explanation}
                    </p>

                    {/* Variables Breakdown */}
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Variables:
                      </span>
                      {f.variables.map((v, vIdx) => (
                        <div key={vIdx} className="flex items-center gap-1.5 text-slate-600">
                          <code className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded">{v.symbol}</code>
                          <span>— {v.meaning}</span>
                          {v.unit && <span className="text-slate-400 font-mono">({v.unit})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Definitions */}
          {pack.definitions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span>Key Definitions</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pack.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-slate-200 rounded-lg space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 border-b border-indigo-200 pb-0.5">
                        {def.term}
                      </span>
                      {def.sourceCitation && (
                        <span className="text-[10px] text-slate-400 font-mono">{def.sourceCitation}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Important Questions */}
      {activeTab === 'questions' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                High-Yield Examination Questions
              </h2>
              <p className="text-xs text-slate-500">
                Divided by question type with marking guidelines and model answers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pack.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 bg-slate-50/60 border border-slate-200 rounded-lg space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-indigo-700 font-mono">Q{idx + 1}</span>
                    <span className="text-slate-300">·</span>
                    <span className="uppercase text-[11px] font-semibold text-slate-600">
                      {q.type} Question
                    </span>
                    {q.marks && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 font-mono">{q.marks} Marks</span>
                      </>
                    )}
                  </div>
                  {q.sourceCitation && (
                    <span className="text-[10px] text-slate-400 font-mono">{q.sourceCitation}</span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                  {q.question}
                </p>

                <div className="p-3 bg-white border border-slate-200 rounded text-xs space-y-1">
                  <span className="font-bold text-slate-500 text-[10px] uppercase block">
                    Model Answer / Solution:
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {q.answerGuideline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Quick Revision Sheet */}
      {activeTab === 'revision' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
                Final Review
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Quick Revision Sheet
              </h2>
              <p className="text-xs text-slate-500">
                Everything you need to review in 5 minutes before your exam or presentation.
              </p>
            </div>

            {/* Formula Cheat Table */}
            {pack.revisionSheet.formulaCheatSheet.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Formula Cheat Sheet
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Concept</th>
                        <th className="py-2.5 px-4">Formula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pack.revisionSheet.formulaCheatSheet.map((fc, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2 px-4 font-medium text-slate-800">{fc.name}</td>
                          <td className="py-2 px-4 font-mono font-semibold text-indigo-900">{fc.formula}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Common Pitfalls */}
            {pack.revisionSheet.commonPitfalls.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Common Examination Pitfalls to Avoid</span>
                </h3>
                <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-lg space-y-2">
                  {pack.revisionSheet.commonPitfalls.map((pit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-rose-950 leading-relaxed">
                      <span className="text-rose-600 font-bold shrink-0">▲</span>
                      <span>{pit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Ready to test what you know?
              </span>
              <button
                onClick={onStartQuiz}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Launch Diagnostic Quiz →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Generation & Preview Modal */}
      {isPdfModalOpen && (
        <PDFPreviewModal
          pack={pack}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title={pack.title}
        itemType="study pack"
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          if (onDeletePack) {
            onDeletePack(pack.id);
            onBack();
          }
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
