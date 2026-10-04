import { StudyPack, DifficultyLevel } from '../types';

export interface AnalyzePayload {
  title: string;
  subject?: string;
  difficulty?: DifficultyLevel;
  content?: string;
  imageBase64?: string;
  imagesBase64?: string[];
  mimeType?: string;
  packOptions?: Record<string, boolean>;
  quizQuestionCount?: number;
}

export interface YoutubeResponse {
  success: boolean;
  videoId?: string;
  title?: string;
  author?: string;
  transcript?: string;
  isLong?: boolean;
  hasCaptions?: boolean;
  reason?: string;
  friendlyMessage?: string;
  allowManualTranscript?: boolean;
}

export async function analyzeMaterial(payload: AnalyzePayload): Promise<{ success: boolean; studyPack: StudyPack; isFallback?: boolean }> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze material');
  }

  return response.json();
}

export async function generateCustomQuiz(payload: {
  title: string;
  subject: string;
  difficulty: string;
  questionCount: number;
  questionTypes: string[];
  context?: string;
}): Promise<{ success: boolean; questions: any[]; isFallback?: boolean }> {
  const response = await fetch('/api/quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate quiz');
  }

  return response.json();
}

export async function fetchYoutubeLecture(url: string): Promise<YoutubeResponse> {
  const response = await fetch('/api/youtube', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to retrieve YouTube lecture');
  }

  return response.json();
}

export async function sendStudyChat(payload: {
  messages: { role: 'user' | 'model'; content: string }[];
  context?: any;
  forceSearch?: boolean;
}): Promise<{ reply: string; isGrounded: boolean; sources: { title: string; url: string }[] }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to communicate with Study Chat');
  }

  return response.json();
}

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'error', hasApiKey: false };
    return res.json();
  } catch {
    return { status: 'offline', hasApiKey: false };
  }
}
