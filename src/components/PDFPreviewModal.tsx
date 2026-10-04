import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Printer, 
  Check, 
  Sliders, 
  Sparkles,
  BookOpen,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StudyPack, PDFExportSettings, PDFStyle } from '../types';
import { downloadStudyGuide } from '../services/pdfGenerator';

interface PDFPreviewModalProps {
  pack: StudyPack;
  onClose: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  pack,
  onClose,
}) => {
  const [settings, setSettings] = useState<PDFExportSettings>({
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
  });

  const [previewPage, setPreviewPage] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Dynamic estimate based on enabled modules
  const calculatePages = () => {
    let count = 1; // Cover page
    if (settings.includeToc) count += 1;
    if (settings.includeChapterNotes) count += Math.max(1, Math.ceil(pack.chapters.length / 2));
    if (settings.includeFormulas && pack.formulas.length > 0) count += 1;
    if (settings.includeDefinitions && pack.definitions.length > 0) count += 1;
    if (settings.includeQuestions && pack.questions.length > 0) count += 1;
    if (settings.includeMcqs && pack.mcqs.length > 0) count += 1;
    if (settings.includeQuickRevision) count += 1;
    return Math.max(1, count);
  };

  const totalPagesEstimate = calculatePages();

  const handleSelectAllContent = (val: boolean) => {
    setSettings((prev) => ({
      ...prev,
      includeExecutiveSummary: val,
      includeChapterNotes: val,
      includeKeyIdeas: val,
      includeDefinitions: val,
      includeFormulas: val,
      includeQuestions: val,
      includeAnswers: val,
      includeMcqs: val,
      includeQuickRevision: val,
      includeCommonPitfalls: val,
    }));
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      try {
        downloadStudyGuide(pack, settings);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } catch (err) {
        console.error('PDF generation error:', err);
      } finally {
        setIsDownloading(false);
      }
    }, 200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Your Study Guide is Ready
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{totalPagesEstimate} Pages</span>
              <span aria-hidden="true">·</span>
              <span>{pack.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{pack.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{settings.style} Style</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns (Left: Document Page Preview, Right: Document Settings) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* LEFT: Live Document Page Simulation (7 cols) */}
          <div className="lg:col-span-7 p-6 bg-slate-100/70 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col items-center justify-between space-y-4">
            {/* Page Canvas Container */}
            <div className="w-full max-w-[420px] aspect-[1/1.414] bg-white border border-slate-300 shadow-md rounded-sm p-6 flex flex-col justify-between text-slate-800 text-[11px] leading-relaxed transition-all select-none">
              {/* PAGE 1: COVER PREVIEW */}
              {previewPage === 1 && (
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="h-1 bg-indigo-600 w-full" />
                    <div>
                      <span className="font-bold text-xl tracking-tight text-slate-900 block font-serif">
                        DASTANAY
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Turn Learning Into a Story.
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-1">
                      <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider block">
                        Study Guide
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{pack.title}</h3>
                      <p className="text-[10px] text-slate-500">
                        Subject: {pack.subject} · {pack.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-4 text-[9px] text-slate-500">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Publication:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Source:</span>
                      <span className="truncate max-w-[150px]">{pack.sourceAttribution || 'Educational Notes'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Layout:</span>
                      <span className="capitalize">{settings.style} Format ({settings.paper.toUpperCase()})</span>
                    </div>
                  </div>

                  <p className="text-[8px] text-slate-400 italic text-center pt-2">
                    Generated by DASTANAY AI from user-provided material.
                  </p>
                </div>
              )}

              {/* PAGE 2: TABLE OF CONTENTS */}
              {previewPage === 2 && (
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-indigo-600 pb-1">
                      Table of Contents
                    </h4>
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                        <span>01. 5-Minute Executive Summary</span>
                        <span className="font-mono text-slate-400">3</span>
                      </div>
                      {pack.chapters.map((ch, idx) => (
                        <div key={idx} className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                          <span className="truncate max-w-[240px]">0{idx + 2}. {ch.chapterTitle}</span>
                          <span className="font-mono text-slate-400">{idx + 4}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                        <span>05. Key Formulas & Mathematical Laws</span>
                        <span className="font-mono text-slate-400">5</span>
                      </div>
                      <div className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                        <span>06. Quick Revision Sheet & Pitfalls</span>
                        <span className="font-mono text-slate-400">6</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-indigo-50/50 rounded border border-indigo-100 text-[9px] text-indigo-950 space-y-1">
                    <span className="font-bold block">Summary Snapshot:</span>
                    <p className="line-clamp-3 text-slate-600">{pack.summary}</p>
                  </div>

                  <div className="text-[9px] text-slate-400 text-right font-mono">
                    Page 2 of {totalPagesEstimate}
                  </div>
                </div>
              )}

              {/* PAGE 3: CHAPTER CONTENT */}
              {previewPage === 3 && (
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-indigo-900 border-b border-slate-200 pb-1">
                      Chapter 1: {pack.chapters[0]?.chapterTitle || 'Principles'}
                    </h4>

                    <div className="space-y-1">
                      <span className="font-bold text-[9px] uppercase text-slate-700 block">1. Main Concept</span>
                      <p className="line-clamp-3 text-slate-600 text-[10px] leading-relaxed">
                        {pack.chapters[0]?.mainConcept}
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 border-l-2 border-indigo-600 rounded text-[9.5px]">
                      <span className="font-bold text-indigo-900 block text-[8px] uppercase">Key Idea</span>
                      <p className="line-clamp-2 text-slate-700">{pack.chapters[0]?.keyIdea}</p>
                    </div>

                    {pack.formulas[0] && (
                      <div className="p-2 bg-slate-100 rounded text-center font-mono font-bold text-xs text-indigo-950">
                        {pack.formulas[0].formula}
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-400 text-right font-mono">
                    Page 3 of {totalPagesEstimate}
                  </div>
                </div>
              )}

              {/* PAGE 4: FORMULAS & DEFINITIONS */}
              {previewPage === 4 && (
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1">
                      Key Formulas & Definitions
                    </h4>

                    <div className="space-y-2">
                      {pack.formulas.slice(0, 2).map((f, i) => (
                        <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded text-[9px] space-y-1">
                          <span className="font-bold text-indigo-900">{f.name}</span>
                          <div className="font-mono font-bold text-[11px] text-center bg-white p-1 rounded">
                            {f.formula}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {pack.definitions.slice(0, 2).map((def, i) => (
                        <div key={i} className="text-[9px] space-y-0.5">
                          <span className="font-bold text-slate-800">{def.term}: </span>
                          <span className="text-slate-600">{def.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 text-right font-mono">
                    Page 4 of {totalPagesEstimate}
                  </div>
                </div>
              )}

              {/* PAGE 5: QUESTIONS & ANSWERS */}
              {previewPage === 5 && (
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1">
                      Examination Questions
                    </h4>

                    <div className="space-y-2">
                      {pack.questions.slice(0, 2).map((q, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200 text-[9px] space-y-1">
                          <span className="font-bold text-indigo-800">Q{i + 1} [{q.type.toUpperCase()}]</span>
                          <p className="font-medium text-slate-800">{q.question}</p>
                          <p className="text-slate-500 italic line-clamp-2">Ans: {q.answerGuideline}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 text-right font-mono">
                    Page 5 of {totalPagesEstimate}
                  </div>
                </div>
              )}

              {/* PAGE 6: QUICK REVISION SHEET */}
              {previewPage === 6 && (
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-indigo-900 border-b border-slate-200 pb-1">
                      Quick Revision Sheet (5-Min Review)
                    </h4>

                    <div className="space-y-1 text-[9px]">
                      <span className="font-bold text-slate-800 block">Core Takeaways:</span>
                      {pack.revisionSheet.quickTakeaways.slice(0, 3).map((t, i) => (
                        <div key={i} className="flex items-start gap-1 text-slate-700">
                          <span>•</span>
                          <span className="line-clamp-1">{t}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 text-[9px] p-2 bg-rose-50 rounded border border-rose-100">
                      <span className="font-bold text-rose-900 block">Common Pitfalls:</span>
                      {pack.revisionSheet.commonPitfalls.slice(0, 2).map((p, i) => (
                        <div key={i} className="text-rose-950 line-clamp-1">▲ {p}</div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-2 text-[8px] text-slate-400 text-center font-mono">
                    DASTANAY · Final Review Sheet · Page 6 of {totalPagesEstimate}
                  </div>
                </div>
              )}
            </div>

            {/* Page Switcher Bar */}
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <button
                onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                disabled={previewPage === 1}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs">
                Page {previewPage} of {totalPagesEstimate}
              </span>
              <button
                onClick={() => setPreviewPage(Math.min(totalPagesEstimate, previewPage + 1))}
                disabled={previewPage === totalPagesEstimate}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Document Settings & Generator (5 cols) */}
          <div className="lg:col-span-5 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>PDF Document Settings</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configure format, paper size, and included modules.
                </p>
              </div>

              {/* Design Style Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Design Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'modern', name: 'Modern', desc: 'Card highlights & slate indigo' },
                    { id: 'academic', name: 'Academic', desc: 'Formal university serif style' },
                    { id: 'minimal', name: 'Minimal', desc: 'Black & white print-friendly' },
                    { id: 'notebook', name: 'Notebook', desc: 'Lined margins & warm tone' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, style: st.id as PDFStyle })}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        settings.style === st.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-bold">{st.name}</span>
                      <span className="block text-[10px] text-slate-500">{st.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paper & Length */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paper Size
                  </label>
                  <select
                    value={settings.paper}
                    onChange={(e) => setSettings({ ...settings, paper: e.target.value as 'a4' | 'letter' })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="letter">US Letter (8.5 × 11 in)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Length
                  </label>
                  <select
                    value={settings.length}
                    onChange={(e) => setSettings({ ...settings, length: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="short">Short (3 pages)</option>
                    <option value="standard">Standard (6 pages)</option>
                    <option value="detailed">Detailed (Full Coverage)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Content Types Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Content Types to Include
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSelectAllContent(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllContent(false)}
                      className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-56 overflow-y-auto">
                  {[
                    { key: 'includeExecutiveSummary', label: '5-Minute Summary', desc: 'Core subject overview' },
                    { key: 'includeChapterNotes', label: 'Structured Notes', desc: 'Main chapter concepts' },
                    { key: 'includeKeyIdeas', label: 'Key Ideas', desc: 'Highlighted core takeaways' },
                    { key: 'includeDefinitions', label: 'Definitions', desc: 'Key terms and glossary' },
                    { key: 'includeFormulas', label: 'Formulas', desc: 'Variables and units breakdown' },
                    { key: 'includeQuestions', label: 'Exam Questions', desc: 'Short, long, conceptual' },
                    { key: 'includeAnswers', label: 'Model Answers', desc: 'Step-by-step solutions' },
                    { key: 'includeMcqs', label: 'MCQs', desc: 'Practice questions & rationales' },
                    { key: 'includeQuickRevision', label: 'Revision Sheet', desc: 'Final review cheat sheet' },
                    { key: 'includeCommonPitfalls', label: 'Common Pitfalls', desc: 'Exam traps to avoid' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-2 p-1.5 rounded hover:bg-white transition-colors cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings[item.key as keyof PDFExportSettings] as boolean}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="leading-tight">
                        <span className="font-semibold text-slate-800 block text-[11px]">{item.label}</span>
                        <span className="text-[10px] text-slate-500">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Document Formatting Options */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.includeToc}
                      onChange={(e) => setSettings({ ...settings, includeToc: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 text-[11px]">Table of contents</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settings.includePageNumbers}
                      onChange={(e) => setSettings({ ...settings, includePageNumbers: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 text-[11px]">Footer page numbers</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Study Guide Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Generating PDF...' : 'Download Study Guide (.pdf)'}</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
