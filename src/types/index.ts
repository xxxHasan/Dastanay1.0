export type MaterialType = 'pdf' | 'notes_image' | 'camera' | 'youtube' | 'text';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Exam Focused';

export type PDFStyle = 'academic' | 'modern' | 'minimal' | 'notebook';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  avatar?: string;
  createdAt: string;
}

export interface CapturedPage {
  id: string;
  pageNumber: number;
  base64: string;
  previewUrl?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: MaterialType;
  subject: string;
  sourceName: string;
  createdAt: string;
  pageCount?: number;
  duration?: string;
  rawContent?: string;
  videoId?: string;
  thumbnailUrl?: string;
  pages?: CapturedPage[];
}

export interface ChapterNote {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  mainConcept: string;
  keyIdea: string;
  remember: string;
  example?: string;
  sourceCitation?: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
  sourceCitation?: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  explanation: string;
  variables: { symbol: string; meaning: string; unit?: string }[];
  sourceCitation?: string;
}

export interface QuestionItem {
  id: string;
  type: 'short' | 'long' | 'conceptual' | 'numerical';
  question: string;
  answerGuideline: string;
  marks?: number;
  sourceCitation?: string;
}

export interface MCQItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  type?: 'mcq' | 'true_false' | 'multi_choice';
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  topic: string;
  isDifficult?: boolean;
  isMastered?: boolean;
}

export interface RevisionSheet {
  quickTakeaways: string[];
  formulaCheatSheet: { name: string; formula: string }[];
  commonPitfalls: string[];
  fiveMinuteSummary: string;
}

export interface StudyPack {
  id: string;
  materialId?: string;
  userId?: string;
  title: string;
  subject: string;
  difficulty: DifficultyLevel;
  createdAt: string;
  summary: string;
  chapters: ChapterNote[];
  definitions: DefinitionItem[];
  formulas: FormulaItem[];
  questions: QuestionItem[];
  mcqs: MCQItem[];
  flashcards: FlashcardItem[];
  revisionSheet: RevisionSheet;
  sourceAttribution?: string;
  isDemo?: boolean;
}

export interface RevisionPlanBlock {
  timeRange: string;
  title: string;
  focus: string;
  actionItems: string[];
}

export interface RevisionPlan {
  id: string;
  totalMinutes: number;
  diagnosticSummary: string;
  blocks: RevisionPlanBlock[];
}

export interface QuizAttempt {
  id: string;
  packId: string;
  userId?: string;
  date: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  selectedAnswers: Record<string, number>;
  weakTopics: string[];
  strongTopics: string[];
  revisionPlan?: RevisionPlan;
}

export interface QuizConfig {
  questionCount: number; // 10 to 25
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  questionTypes: ('mcq' | 'true_false' | 'multi_choice')[];
}

export interface PDFExportSettings {
  style: PDFStyle;
  paper: 'a4' | 'letter';
  length: 'short' | 'standard' | 'detailed';
  language: 'English' | 'Urdu' | 'Roman Urdu';
  // Granular section selection
  includePageNumbers: boolean;
  includeToc: boolean;
  includeExecutiveSummary: boolean;
  includeChapterNotes: boolean;
  includeKeyIdeas: boolean;
  includeDefinitions: boolean;
  includeFormulas: boolean;
  includeQuestions: boolean;
  includeAnswers: boolean;
  includeMcqs: boolean;
  includeQuickRevision: boolean;
  includeCommonPitfalls: boolean;
}

export interface UserPreferences {
  name: string;
  email: string;
  isGuest: boolean;
  theme: ThemeMode;
  defaultDifficulty: DifficultyLevel;
  defaultQuizSize: number;
  defaultPdfStyle: PDFStyle;
  language: string;
  prefersReducedMotion: boolean;
}
