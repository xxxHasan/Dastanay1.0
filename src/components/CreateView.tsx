import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Camera, 
  Video, 
  PenTool, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  X, 
  ArrowRight,
  Layers,
  Plus,
  Trash2,
  Minus
} from 'lucide-react';
import { MaterialType, DifficultyLevel, CapturedPage } from '../types';
import { fetchYoutubeLecture } from '../services/api';
import { SUBJECT_PRESETS } from '../data/subjectPresets';
import { CameraScanner } from './CameraScanner';

interface CreateViewProps {
  initialType?: MaterialType;
  initialSubject?: string;
  onAnalyze: (payload: {
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
  }) => void;
  onCancel: () => void;
}

export const CreateView: React.FC<CreateViewProps> = ({
  initialType = 'pdf',
  initialSubject = 'Physics',
  onAnalyze,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<MaterialType>(initialType === 'notes_image' ? 'camera' : initialType);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Exam Focused');

  // Input states
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    base64?: string;
    text?: string;
  } | null>(null);

  // Multi-image/Camera states
  const [capturedPages, setCapturedPages] = useState<CapturedPage[]>([]);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // YouTube states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isCheckingYt, setIsCheckingYt] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [ytResult, setYtResult] = useState<{
    videoId: string;
    title: string;
    author: string;
    transcript: string;
    isLong?: boolean;
  } | null>(null);
  const [manualTranscriptMode, setManualTranscriptMode] = useState(false);
  const [manualTranscriptText, setManualTranscriptText] = useState('');
  const [lectureScope, setLectureScope] = useState<'full' | 'first_30' | 'key_sections'>('full');

  // Text state
  const [textContent, setTextContent] = useState('');

  // Quiz Question Count (10 to 25)
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(10);

  // Study Pack Options Checkboxes
  const [packOptions, setPackOptions] = useState({
    notes: true,
    summary: true,
    definitions: true,
    formulas: true,
    questions: true,
    mcqs: true,
    flashcards: true,
    quiz: true,
    revision: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiImageInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setPackOptions({
      notes: checked,
      summary: checked,
      definitions: checked,
      formulas: checked,
      questions: checked,
      mcqs: checked,
      flashcards: checked,
      quiz: checked,
      revision: checked,
    });
  };

  const handleFileChange = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt');
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Str = (reader.result as string).split(',')[1];
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          type: file.type,
          base64: base64Str,
        });
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      };
      reader.readAsDataURL(file);
    } else if (isText) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setUploadedFile({
          name: file.name,
          size: sizeStr,
          type: file.type,
          text,
        });
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      };
      reader.readAsText(file);
    } else {
      // PDF or Doc representation
      setUploadedFile({
        name: file.name,
        size: sizeStr,
        type: 'application/pdf',
        text: `Source Document: ${file.name}\nSize: ${sizeStr}\nReady for deep contextual comprehension and formula extraction.`,
      });
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleMultiImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        setCapturedPages((prev) => [
          ...prev,
          {
            id: `up-${Date.now()}-${idx}`,
            pageNumber: prev.length + 1,
            base64,
            previewUrl: dataUrl,
          },
        ]);
        if (!title) setTitle('Scanned Notes');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleYoutubeCheck = async () => {
    if (!youtubeUrl.trim()) {
      setYtError('Please enter a YouTube video URL first.');
      return;
    }

    setIsCheckingYt(true);
    setYtError(null);
    setYtResult(null);

    try {
      const res = await fetchYoutubeLecture(youtubeUrl.trim());
      if (res.success && res.transcript) {
        setYtResult({
          videoId: res.videoId || '',
          title: res.title || 'Educational Lecture',
          author: res.author || 'YouTube Educator',
          transcript: res.transcript,
          isLong: res.isLong,
        });
        if (!title) setTitle(res.title || 'YouTube Lecture');
        setManualTranscriptMode(false);
      } else {
        setYtError(res.friendlyMessage || "DASTANAY couldn't access a transcript for this video.");
        setManualTranscriptMode(true);
        if (res.title && !title) setTitle(res.title);
      }
    } catch {
      setYtError("DASTANAY couldn't access a transcript for this video.");
      setManualTranscriptMode(true);
    } finally {
      setIsCheckingYt(false);
    }
  };

  const loadSampleYoutube = (subKey: string) => {
    const preset = SUBJECT_PRESETS[subKey] || SUBJECT_PRESETS.Physics;
    setYoutubeUrl(preset.sampleYoutubeUrl || 'https://www.youtube.com/watch?v=1rYXZoUuVTE');
    setSubject(preset.name);
    setTitle(preset.defaultTitle);
    setYtResult({
      videoId: '1rYXZoUuVTE',
      title: preset.lectureTitle || preset.defaultTitle,
      author: 'Academic Faculty Lecture Series',
      transcript: preset.sampleYoutubeTranscript || '',
      isLong: false,
    });
    setYtError(null);
    setManualTranscriptMode(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalContent = '';
    let finalBase64: string | undefined = undefined;
    let finalImagesBase64: string[] | undefined = undefined;
    let finalMime: string | undefined = undefined;
    let sourceName = 'User Material';

    if (activeTab === 'pdf') {
      if (!uploadedFile) {
        alert('Please select or drop a file first.');
        return;
      }
      sourceName = uploadedFile.name;
      if (uploadedFile.base64) {
        finalBase64 = uploadedFile.base64;
        finalMime = uploadedFile.type;
        finalContent = `File: ${uploadedFile.name}`;
      } else {
        finalContent = uploadedFile.text || `Document ${uploadedFile.name}`;
      }
    } else if (activeTab === 'camera') {
      if (capturedPages.length === 0) {
        alert('Please scan or upload at least one note page.');
        return;
      }
      sourceName = `Scanned Notes (${capturedPages.length} Pages)`;
      finalImagesBase64 = capturedPages.map((p) => p.base64);
      finalContent = `Scanned ${capturedPages.length} pages of learning material.`;
    } else if (activeTab === 'youtube') {
      if (ytResult && ytResult.transcript) {
        sourceName = `YouTube: ${ytResult.title}`;
        finalContent = `LECTURE TITLE: ${ytResult.title}\nAUTHOR: ${ytResult.author}\nSCOPE: ${lectureScope}\n\nTRANSCRIPT:\n${ytResult.transcript}`;
      } else if (manualTranscriptText.trim()) {
        sourceName = youtubeUrl ? `YouTube: ${youtubeUrl}` : 'Pasted Lecture Transcript';
        finalContent = manualTranscriptText.trim();
      } else {
        alert('Please analyze a YouTube lecture or provide a transcript.');
        return;
      }
    } else {
      // Text mode
      if (!textContent.trim()) {
        alert('Add some learning material first.');
        return;
      }
      sourceName = 'Pasted Educational Text';
      finalContent = textContent.trim();
    }

    onAnalyze({
      title: title.trim() || 'Untitled Study Pack',
      subject: subject || 'General',
      difficulty,
      content: finalContent,
      imageBase64: finalBase64,
      imagesBase64: finalImagesBase64,
      mimeType: finalMime,
      packOptions,
      sourceType: activeTab,
      sourceName,
      quizQuestionCount,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Screen Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            What do you want to learn today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose your learning source and configure your structured study pack.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Source Selector 4 Tabs: Upload, Camera, YouTube, Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Select Learning Source
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>📄 Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>📷 Camera</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'youtube'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>🎥 YouTube</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>✍️ Text</span>
            </button>
          </div>
        </div>

        {/* Tab 1: PDF / Document Upload */}
        {activeTab === 'pdf' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Upload Study Document
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Supported formats: PDF, DOCX, TXT. DASTANAY structures chapters and formulas.
            </p>

            {!uploadedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">Choose file</span> or drag & drop here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">PDF or document up to 25 MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{uploadedFile.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{uploadedFile.size}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">Ready to analyze</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Camera & Multi-Page Scanner */}
        {activeTab === 'camera' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                  Scan Notes, Whiteboards & Diagrams
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Take photos with your device camera or upload multiple pages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraScannerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Open Scanner</span>
                </button>

                <button
                  type="button"
                  onClick={() => multiImageInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Images</span>
                </button>
              </div>
            </div>

            <input
              ref={multiImageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleMultiImageFiles}
              className="hidden"
            />

            {/* Gallery of Scanned Pages */}
            {capturedPages.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">
                    {capturedPages.length} {capturedPages.length === 1 ? 'Page' : 'Pages'} Ready for AI Extraction
                  </span>
                  <button
                    type="button"
                    onClick={() => setCapturedPages([])}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    Clear All Pages
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {capturedPages.map((p, idx) => (
                    <div
                      key={p.id}
                      className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-[3/4]"
                    >
                      <img
                        src={p.previewUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 p-2 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded font-mono w-max">
                          Page {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCapturedPages((prev) => prev.filter((item) => item.id !== p.id))}
                          className="self-end p-1 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                          title="Remove page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  No pages scanned yet
                </p>
                <p className="text-[11px] text-slate-400">
                  Tap "Open Scanner" to take photos or "Upload Images" to select multiple note photos.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: YouTube Feature */}
        {activeTab === 'youtube' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Learn from a lecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste any educational YouTube URL. We read the lecture transcript to extract notes, formulas, and quizzes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              />
              <button
                type="button"
                onClick={handleYoutubeCheck}
                disabled={isCheckingYt}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                {isCheckingYt ? 'Checking...' : 'Analyze Lecture'}
              </button>
            </div>

            {/* Educational Preset Shortcut */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Or try sample:</span>
              <button
                type="button"
                onClick={() => loadSampleYoutube('Physics')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                MIT Physics 8.01 (Kinematics)
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => loadSampleYoutube('Computer Science')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                CS50 Binary Search
              </button>
            </div>

            {/* Long lecture options if detected */}
            {ytResult?.isLong && (
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>Long lecture detected</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  This lecture contains extensive transcript coverage. Select processing scope:
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="lectureScope"
                      checked={lectureScope === 'full'}
                      onChange={() => setLectureScope('full')}
                      className="text-indigo-600"
                    />
                    <span>Full lecture</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="lectureScope"
                      checked={lectureScope === 'first_30'}
                      onChange={() => setLectureScope('first_30')}
                      className="text-indigo-600"
                    />
                    <span>First 30 minutes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="lectureScope"
                      checked={lectureScope === 'key_sections'}
                      onChange={() => setLectureScope('key_sections')}
                      className="text-indigo-600"
                    />
                    <span>Key Concept Chapters</span>
                  </label>
                </div>
              </div>
            )}

            {/* YouTube Success Card */}
            {ytResult && (
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">{ytResult.title}</span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Transcript Verified</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 font-mono bg-white/70 dark:bg-slate-800 p-2 rounded border border-emerald-100 dark:border-emerald-900">
                  {ytResult.transcript.slice(0, 220)}...
                </p>
              </div>
            )}

            {/* YouTube Friendly Error with Fallback */}
            {ytError && (
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-xs space-y-3">
                <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{ytError}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      You can paste the lecture transcript below or upload a .srt / .txt file.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setManualTranscriptMode(true)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    Paste Transcript
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleYoutube('Physics')}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium rounded-md hover:bg-indigo-100 cursor-pointer"
                  >
                    Load Sample Physics Transcript
                  </button>
                </div>
              </div>
            )}

            {manualTranscriptMode && (
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Paste Transcript or Notes from Video
                </label>
                <textarea
                  rows={5}
                  value={manualTranscriptText}
                  onChange={(e) => setManualTranscriptText(e.target.value)}
                  placeholder="Paste timestamped transcript, video captions, or lecture notes here..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white font-mono leading-relaxed"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Paste Text */}
        {activeTab === 'text' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                  Paste Study Material
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste textbook excerpts, definitions, problems, or lecture transcripts.
                </p>
              </div>
            </div>

            <textarea
              rows={7}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste educational material here..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white leading-relaxed"
            />
          </div>
        )}

        {/* Study Pack Details (Title, Subject, Difficulty) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Study Pack Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Study Pack Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kinematics & Mechanics"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              >
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Difficulty & Focus Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced', 'Exam Focused'] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                    difficulty === level
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz Configuration (10 to 25 questions) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                How many quiz questions?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customizable range: 10 to 25 questions.
              </p>
            </div>

            {/* Stepper Control */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuizQuestionCount((prev) => Math.max(10, prev - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Decrease question count"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums w-8 text-center">
                {quizQuestionCount}
              </span>

              <button
                type="button"
                onClick={() => setQuizQuestionCount((prev) => Math.min(25, prev + 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Increase question count"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets (10, 15, 20, 25) */}
          <div className="flex items-center gap-2 pt-1">
            {[10, 15, 20, 25].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setQuizQuestionCount(cnt)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md border transition-colors cursor-pointer ${
                  quizQuestionCount === cnt
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cnt} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Build Your Study Pack Checkboxes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Build your study pack
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the tools you want generated for this material.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectAll(Object.values(packOptions).some(v => !v))}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {Object.values(packOptions).every(Boolean) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'notes', label: 'Smart Notes', desc: 'Chapter structure & concepts' },
              { key: 'summary', label: 'Summary', desc: '5-minute executive overview' },
              { key: 'definitions', label: 'Key Definitions', desc: 'Framed academic terms' },
              { key: 'formulas', label: 'Important Formulas', desc: 'Variables & units breakdown' },
              { key: 'questions', label: 'Important Questions', desc: 'Short, long, conceptual, numerical' },
              { key: 'mcqs', label: 'MCQs', desc: `${quizQuestionCount} practice questions` },
              { key: 'flashcards', label: 'Flashcards', desc: 'Flip cards with spaced review' },
              { key: 'quiz', label: 'Practice Quiz', desc: 'Diagnostic scoring & weak spots' },
              { key: 'revision', label: 'Quick Revision Sheet', desc: 'Cheat sheet & pitfalls' },
            ].map((opt) => (
              <label
                key={opt.key}
                className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={packOptions[opt.key as keyof typeof packOptions]}
                  onChange={(e) =>
                    setPackOptions({
                      ...packOptions,
                      [opt.key]: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {opt.label}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    {opt.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <span>Analyze Material & Build Pack</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Camera Scanner Modal */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <CameraScanner
              onCaptureComplete={(pages) => {
                setCapturedPages((prev) => [...prev, ...pages]);
                setIsCameraScannerOpen(false);
              }}
              onCancel={() => setIsCameraScannerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
