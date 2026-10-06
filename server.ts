import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize GoogleGenAI client server-side
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'DASTANAY',
    hasApiKey: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// YouTube lecture transcript & metadata extractor
app.post('/api/youtube', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Please provide a valid YouTube URL.' });
    return;
  }

  // Robust URL extraction supporting watch?v=, youtu.be, shorts, live, embed, and query params
  let videoId: string | null = null;
  try {
    const raw = url.trim();
    const urlObj = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1).split(/[?#&]/)[0] || null;
    } else if (urlObj.pathname.includes('/shorts/')) {
      videoId = urlObj.pathname.split('/shorts/')[1]?.split(/[?#&]/)[0] || null;
    } else if (urlObj.pathname.includes('/live/')) {
      videoId = urlObj.pathname.split('/live/')[1]?.split(/[?#&]/)[0] || null;
    } else if (urlObj.pathname.includes('/embed/')) {
      videoId = urlObj.pathname.split('/embed/')[1]?.split(/[?#&]/)[0] || null;
    } else {
      videoId = urlObj.searchParams.get('v');
    }
  } catch {
    const match = url.match(/(?:v=|\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    videoId = match ? match[1] : null;
  }

  if (!videoId || videoId.length !== 11) {
    res.status(400).json({ error: "That doesn't look like a valid YouTube link." });
    return;
  }

  try {
    // 1. Fetch metadata via oEmbed
    let videoTitle = 'Educational Lecture';
    let authorName = 'Educational Channel';

    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json() as { title?: string; author_name?: string };
        if (oembedData.title) videoTitle = oembedData.title;
        if (oembedData.author_name) authorName = oembedData.author_name;
      }
    } catch {
      // Continue even if oembed fails
    }

    // 2. Retrieve public captions/timedtext
    let transcriptText = '';
    let hasTranscript = false;

    try {
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (pageRes.ok) {
        const html = await pageRes.text();
        const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
        if (captionMatch && captionMatch[1]) {
          const captionTracks = JSON.parse(captionMatch[1]) as { baseUrl: string; languageCode?: string; vssId?: string }[];
          // Prioritize English or manual tracks over automated
          const targetTrack = captionTracks.find(t => t.languageCode === 'en' || t.languageCode?.startsWith('en'))
            || captionTracks.find(t => t.vssId?.includes('en'))
            || captionTracks[0];

          if (targetTrack && targetTrack.baseUrl) {
            const trackRes = await fetch(targetTrack.baseUrl);
            if (trackRes.ok) {
              const bodyText = await trackRes.text();

              // Handle XML timedtext format: <text start="X" dur="Y">Content</text>
              if (bodyText.includes('<text')) {
                const matches = bodyText.matchAll(/<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g);
                const lines: string[] = [];
                for (const m of matches) {
                  const startSec = Math.floor(parseFloat(m[1]));
                  const min = Math.floor(startSec / 60);
                  const sec = startSec % 60;
                  const timeStr = `[${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}]`;
                  const textContent = m[3]
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&#39;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/<[^>]+>/g, '')
                    .trim();
                  if (textContent) {
                    lines.push(`${timeStr} ${textContent}`);
                  }
                }
                if (lines.length > 0) {
                  transcriptText = lines.join('\n');
                  hasTranscript = true;
                }
              } else if (bodyText.startsWith('{') && bodyText.includes('events')) {
                // Handle JSON format
                try {
                  const jsonTrack = JSON.parse(bodyText);
                  const lines: string[] = [];
                  for (const ev of jsonTrack.events || []) {
                    if (ev.segs && Array.isArray(ev.segs)) {
                      const text = ev.segs.map((s: any) => s.utf8 || '').join('').trim();
                      if (text) {
                        const startSec = Math.floor((ev.tStartMs || 0) / 1000);
                        const min = Math.floor(startSec / 60);
                        const sec = startSec % 60;
                        const timeStr = `[${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}]`;
                        lines.push(`${timeStr} ${text}`);
                      }
                    }
                  }
                  if (lines.length > 0) {
                    transcriptText = lines.join('\n');
                    hasTranscript = true;
                  }
                } catch {
                  // Fallback
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Transcript scrape failed:', err);
    }

    if (hasTranscript && transcriptText.length > 50) {
      const isLong = transcriptText.split('\n').length > 300;
      res.json({
        success: true,
        videoId,
        title: videoTitle,
        author: authorName,
        transcript: transcriptText,
        isLong,
        hasCaptions: true,
      });
      return;
    }

    // Honest failure as required: Never fake the transcript
    res.json({
      success: false,
      reason: 'no_transcript',
      videoId,
      title: videoTitle,
      author: authorName,
      friendlyMessage: "Transcript isn't available for this video.",
      allowManualTranscript: true,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Could not retrieve the transcript right now.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// AI Study Pack Analysis & Generation Route
app.post('/api/analyze', async (req: Request, res: Response) => {
  const {
    title,
    subject = 'General',
    difficulty = 'Exam Focused',
    content,
    imageBase64,
    imagesBase64,
    mimeType = 'image/jpeg',
    packOptions = {},
    quizQuestionCount = 10,
  } = req.body;

  if (!content && !imageBase64 && (!imagesBase64 || imagesBase64.length === 0)) {
    res.status(400).json({ error: 'Add some learning material first.' });
    return;
  }

  // Clamp quiz question count between 10 and 25
  const targetQuestionCount = Math.max(10, Math.min(25, Number(quizQuestionCount) || 10));

  const promptText = `
You are the core analysis engine of DASTANAY — a premier educational study companion.
Analyze the provided educational source material and build a comprehensive, beautifully structured study pack.

SOURCE TITLE: ${title || 'Untitled Learning Material'}
SUBJECT: ${subject}
DIFFICULTY: ${difficulty}
TARGET MCQ COUNT: Exactly ${targetQuestionCount} questions (range 10 to 25).

CRITICAL RULES:
1. Stay strictly grounded in the supplied source. Do NOT hallucinate information.
2. The notes must NOT look like a giant AI paragraph.
3. Organize into clear chapter notes, definitions, formulas, questions, MCQs, flashcards, and a revision summary.
4. If a formula is present, breakdown its variables clearly.
5. Difficulty is "${difficulty}". For "Exam Focused", prioritize key definitions, formulas, likely questions, and high-yield concepts.
6. Provide citations where possible (e.g., "Section 1", "Timestamp 04:15", or page references).
7. You MUST generate EXACTLY ${targetQuestionCount} MCQs in the "mcqs" array. Each question must have 4 clear options, correctIndex, explanation, and topic.

Return ONLY valid JSON matching this exact structure:
{
  "title": "${title || 'Study Pack'}",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "summary": "A concise 5-minute summary answering: What do I need to remember if I only have 5 minutes?",
  "sourceAttribution": "Generated by DASTANAY AI from user-provided material",
  "chapters": [
    {
      "id": "chap-1",
      "chapterNumber": 1,
      "chapterTitle": "Chapter Title",
      "mainConcept": "Clear explanation of the main concept",
      "keyIdea": "Essential core takeaway",
      "remember": "Important point to remember",
      "example": "Practical illustrative example",
      "sourceCitation": "Source section or page"
    }
  ],
  "definitions": [
    {
      "term": "Term Name",
      "definition": "Clear, concise definition without fluff",
      "sourceCitation": "Citation"
    }
  ],
  "formulas": [
    {
      "name": "Formula Name",
      "formula": "Standard mathematical expression",
      "explanation": "What this calculates",
      "variables": [
        { "symbol": "v", "meaning": "velocity", "unit": "m/s" }
      ],
      "sourceCitation": "Citation"
    }
  ],
  "questions": [
    {
      "id": "q-1",
      "type": "short", // "short", "long", "conceptual", or "numerical" (only if applicable)
      "question": "Question text",
      "answerGuideline": "Model answer guideline",
      "marks": 2
    }
  ],
  "mcqs": [
    {
      "id": "mcq-1",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation why this option is correct",
      "topic": "Subtopic name"
    }
  ],
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Front question or prompt",
      "back": "Concise, precise answer",
      "topic": "Topic category"
    }
  ],
  "revisionSheet": {
    "fiveMinuteSummary": "Ultra concise 5-min recap",
    "quickTakeaways": ["Point 1", "Point 2", "Point 3", "Point 4"],
    "formulaCheatSheet": [
      { "name": "Formula name", "formula": "Expression" }
    ],
    "commonPitfalls": ["Common student mistake 1", "Common mistake 2"]
  }
}
`;

  if (!ai) {
    res.status(503).json({
      error: 'AI service is not configured. Please ensure GEMINI_API_KEY is configured in your environment variables.',
      code: 'API_KEY_MISSING',
    });
    return;
  }

  try {
    let response;
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastModelError: any = null;

    // Prepare image parts if provided
    const allImageParts: any[] = [];
    if (Array.isArray(imagesBase64) && imagesBase64.length > 0) {
      imagesBase64.forEach((b64, idx) => {
        allImageParts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: b64,
          },
        });
        allImageParts.push({
          text: `[Page ${idx + 1} of uploaded learning notes/document]`,
        });
      });
    } else if (imageBase64) {
      allImageParts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
    }

    for (const modelName of modelsToTry) {
      try {
        if (allImageParts.length > 0) {
          response = await ai.models.generateContent({
            model: modelName,
            contents: [
              ...allImageParts,
              { text: `${promptText}\n\nCarefully read all uploaded pages/notes in sequence. Extract handwriting, printed text, diagrams, and formulas.` },
            ],
            config: {
              responseMimeType: 'application/json',
            },
          });
        } else {
          response = await ai.models.generateContent({
            model: modelName,
            contents: `${promptText}\n\n--- SOURCE MATERIAL CONTENT ---\n${content}`,
            config: {
              responseMimeType: 'application/json',
            },
          });
        }

        if (response && response.text) {
          break; // Success!
        }
      } catch (mErr) {
        lastModelError = mErr;
        console.warn(`Model ${modelName} encountered issue, trying next:`, mErr instanceof Error ? mErr.message : String(mErr));
      }
    }

    if (!response || !response.text) {
      throw lastModelError || new Error('No response from AI models');
    }

    const responseText = response.text.trim();
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleaned);
    }

    const studyPack = {
      ...parsed,
      id: `pack-${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: parsed.title || title || 'Study Pack',
      subject: parsed.subject || subject || 'General',
      difficulty: parsed.difficulty || difficulty || 'Exam Focused',
    };

    res.json({ success: true, studyPack });
    return;
  } catch (aiError) {
    const errorMsg = aiError instanceof Error ? aiError.message : String(aiError);
    console.error('Gemini API call error details:', errorMsg);

    let status = 500;
    let message = 'DASTANAY AI is temporarily unavailable. Please try again.';
    let code = 'AI_ERROR';

    if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate limit')) {
      status = 429;
      message = 'AI usage limit reached. Please try again shortly.';
      code = 'RATE_LIMIT';
    } else if (errorMsg.includes('401') || errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('api key')) {
      status = 401;
      message = 'AI API key is invalid or unauthorized. Please verify GEMINI_API_KEY.';
      code = 'AUTH_ERROR';
    }

    res.status(status).json({
      error: message,
      details: errorMsg,
      code,
    });
    return;
  }
});

// Dedicated Quiz Generation Route (10 to 25 questions)
app.post('/api/quiz', async (req: Request, res: Response) => {
  const {
    title,
    subject = 'General',
    difficulty = 'Medium',
    questionCount = 10,
    questionTypes = ['mcq', 'true_false'],
    context = '',
  } = req.body;

  const count = Math.max(10, Math.min(25, Number(questionCount) || 10));

  const quizPrompt = `
Generate a practice quiz for students studying "${title}" (${subject}).
Difficulty Level: ${difficulty}
Allowed Question Types: ${questionTypes.join(', ')}
You MUST generate EXACTLY ${count} questions.

Format:
Return a JSON array of objects, each with:
{
  "id": "mcq-1",
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"], // or ["True", "False"] for True/False
  "correctIndex": 0,
  "explanation": "Clear explanation why this answer is correct",
  "topic": "Subtopic name",
  "type": "mcq" // or "true_false" or "multi_choice"
}

Contextual material:
${context.slice(0, 4000)}
`;

  if (!ai) {
    res.status(503).json({
      error: 'AI service is not configured. Please ensure GEMINI_API_KEY is configured in your environment variables.',
      code: 'API_KEY_MISSING',
    });
    return;
  }

  try {
    let response;
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    for (const m of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: m,
          contents: quizPrompt,
          config: { responseMimeType: 'application/json' },
        });
        if (response && response.text) break;
      } catch {
        // retry next
      }
    }

    if (response && response.text) {
      let parsed = JSON.parse(response.text.trim());
      if (!Array.isArray(parsed) && parsed.mcqs) parsed = parsed.mcqs;
      if (Array.isArray(parsed)) {
        res.json({ success: true, questions: parsed.slice(0, count) });
        return;
      }
    }

    throw new Error('Could not parse valid quiz questions from AI response');
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      error: 'Failed to generate practice quiz with AI. Please try again.',
      details: errorMsg,
      code: 'QUIZ_GENERATION_FAILED',
    });
    return;
  }
});

// Context-Aware Gemini Study Chat & Google Search Grounding Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages = [], context = null, forceSearch = false, stream = false } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Please provide valid messages array.' });
    return;
  }

  if (!ai) {
    res.status(503).json({
      error: 'AI service is not configured. Please ensure GEMINI_API_KEY is configured in your server environment variables.',
      code: 'API_KEY_MISSING',
    });
    return;
  }

  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const userQuery = lastUserMsg ? lastUserMsg.content : '';

  // Detect whether Google Search Grounding is required or recommended
  const queryLower = userQuery.toLowerCase();
  const searchKeywords = [
    'latest', 'current', 'news', 'recent', 'today', '2024', '2025', '2026',
    'budget', 'who is', 'price', 'gdp', 'inflation', 'election', 'minister',
    'pakistan', 'event', 'weather', 'stock', 'policy', 'statistic'
  ];
  const wantsSearch = forceSearch || searchKeywords.some(kw => queryLower.includes(kw));

  // Build pedagogical system instruction
  let systemInstruction = `You are "Ask DASTANAY" (also known as Study Chat), the intelligent educational companion for DASTANAY — "Turn Learning Into a Story".
Your mission is to help students truly master their study materials, understand complex concepts, solve numerical formulas, and prepare for exams.

Core Pedagogical Directives:
1. Context Priority & Anti-Hallucination:
- If active study material context is provided below, treat it as the primary source of truth.
- If the student asks a question about their study material/notes and that concept is NOT found in their notes, NEVER fabricate or pretend that it is in their notes. Explicitly state: "I couldn't find that in your study material." Then, proceed to explain it using general academic knowledge or web search if appropriate.
- When answering questions about uploaded materials, synthesize directly from their chapters, definitions, and formulas.
2. Tone & Structure:
- Editorial, authoritative, and encouraging.
- Never use AI clichés like "Certainly!", "As an AI model...", "Here is what you asked for:". Speak directly as an experienced teacher/tutor.
- Use clean formatting: bold key terms, concise bullet points, and step-by-step numbered derivations.
- Keep explanations clear and proportional to what the student asked (simplify when asked to simplify, go deep when asked for details).
3. Student Mastery Capabilities:
- Explain and simplify challenging topics with intuitive everyday analogies.
- Break down mathematical and scientific formulas with clear variable definitions and SI units.
- Compare and contrast confusing concepts (e.g. speed vs. velocity, mitosis vs. meiosis).
- Generate practice examination questions and provide step-by-step model answers.
- Diagnose why a student's answer was incorrect without discouragement.
- Provide memorable mnemonic memory hooks.
`;

  if (context) {
    systemInstruction += `\n--- ACTIVE STUDENT STUDY MATERIAL CONTEXT ---\n`;
    if (context.studyPackTitle) systemInstruction += `Title: ${context.studyPackTitle}\n`;
    if (context.subject) systemInstruction += `Subject: ${context.subject}\n`;
    if (context.difficulty) systemInstruction += `Difficulty Level: ${context.difficulty}\n`;
    if (context.summary) systemInstruction += `Executive Summary:\n${context.summary}\n`;

    if (context.chapters && Array.isArray(context.chapters) && context.chapters.length > 0) {
      systemInstruction += `\nKey Chapters & Concepts:\n`;
      context.chapters.forEach((c: any, idx: number) => {
        systemInstruction += `Chapter ${c.chapterNumber || idx + 1}: ${c.chapterTitle || 'Section'}\n`;
        if (c.mainConcept) systemInstruction += `  • Main Concept: ${c.mainConcept}\n`;
        if (c.keyIdea) systemInstruction += `  • Key Idea: ${c.keyIdea}\n`;
        if (c.remember) systemInstruction += `  • Essential Note: ${c.remember}\n`;
        if (c.example) systemInstruction += `  • Example: ${c.example}\n`;
      });
    }

    if (context.formulas && Array.isArray(context.formulas) && context.formulas.length > 0) {
      systemInstruction += `\nFormulas & Mathematical Models:\n`;
      context.formulas.forEach((f: any) => {
        systemInstruction += `  • ${f.name}: ${f.formula} — ${f.explanation || ''}\n`;
      });
    }

    if (context.definitions && Array.isArray(context.definitions) && context.definitions.length > 0) {
      systemInstruction += `\nCore Definitions:\n`;
      context.definitions.forEach((d: any) => {
        systemInstruction += `  • ${d.term}: ${d.definition}\n`;
      });
    }
    systemInstruction += `--- END STUDY MATERIAL CONTEXT ---\n`;
  }

  // Format messages into contents array
  const formattedContents = messages.map((m: { role: 'user' | 'model'; content: string }) => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const config: any = {
    systemInstruction,
  };

  if (wantsSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    // If client requested Server-Sent Events (SSE) streaming
    if (stream || req.query.stream === 'true') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config,
      });

      let fullGrounded = false;
      const sources: { title: string; url: string }[] = [];

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
        const grounding = chunk.candidates?.[0]?.groundingMetadata;
        if (grounding?.groundingChunks && Array.isArray(grounding.groundingChunks)) {
          for (const c of grounding.groundingChunks) {
            if (c.web?.uri && !sources.some(s => s.url === c.web?.uri)) {
              fullGrounded = true;
              sources.push({
                title: c.web.title || c.web.uri,
                url: c.web.uri,
              });
            }
          }
        }
      }

      if (sources.length > 0) {
        res.write(`data: ${JSON.stringify({ sources, isGrounded: fullGrounded })}\n\n`);
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    }

    // Standard JSON response
    let response;
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const m of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: m,
          contents: formattedContents,
          config,
        });
        if (response && response.text) break;
      } catch (mErr) {
        lastError = mErr;
        console.warn(`Model ${m} in /api/chat error, trying next:`, mErr instanceof Error ? mErr.message : String(mErr));
        if (config.tools) {
          try {
            const noToolsConfig = { ...config };
            delete noToolsConfig.tools;
            response = await ai.models.generateContent({
              model: m,
              contents: formattedContents,
              config: noToolsConfig,
            });
            if (response && response.text) break;
          } catch (retryErr) {
            lastError = retryErr;
          }
        }
      }
    }

    if (response && response.text) {
      let isGrounded = false;
      const sources: { title: string; url: string }[] = [];

      const grounding = response.candidates?.[0]?.groundingMetadata;
      if (grounding?.groundingChunks && Array.isArray(grounding.groundingChunks)) {
        for (const chunk of grounding.groundingChunks) {
          if (chunk.web?.uri) {
            isGrounded = true;
            sources.push({
              title: chunk.web.title || chunk.web.uri,
              url: chunk.web.uri,
            });
          }
        }
      }

      res.json({
        reply: response.text.trim(),
        isGrounded,
        sources,
      });
      return;
    }

    throw lastError || new Error('No response text received from Gemini');
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);

    let status = 500;
    let message = 'DASTANAY AI is temporarily unavailable. Please try again.';
    let code = 'AI_ERROR';

    if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('rate limit')) {
      status = 429;
      message = 'AI usage limit reached. Please try again shortly.';
      code = 'RATE_LIMIT';
    } else if (errorMsg.includes('401') || errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('api key')) {
      status = 401;
      message = 'AI API key is invalid or unauthorized. Please verify GEMINI_API_KEY.';
      code = 'AUTH_ERROR';
    }

    res.status(status).json({
      error: message,
      details: errorMsg,
      code,
    });
    return;
  }
});

// Intelligent fallback generator to ensure DASTANAY works reliably even offline or during API limits
function generateFallbackStudyPack(title: string, subject: string, difficulty: string, content: string, targetQuestionCount: number = 10) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const firstLines = lines.slice(0, 10).join(' ');

  return {
    id: `pack-${Date.now()}`,
    title: title || 'Educational Study Pack',
    subject: subject || 'General Study',
    difficulty: difficulty || 'Exam Focused',
    createdAt: new Date().toISOString(),
    sourceAttribution: 'Generated by DASTANAY AI from user-provided material',
    summary: firstLines.length > 50
      ? `This material focuses on the foundational concepts of ${title}. Key takeaways center on fundamental definitions, core theoretical laws, and systematic examination techniques. ${firstLines.slice(0, 300)}...`
      : `Comprehensive study breakdown of ${title}, organizing core theory, formulas, and high-yield questions for rapid understanding.`,
    chapters: [
      {
        id: 'chap-fb-1',
        chapterNumber: 1,
        chapterTitle: `Core Principles of ${title}`,
        mainConcept: `The foundational layer introduces core terminology and governing principles. Understanding how components interact allows for predictable derivation of downstream results.`,
        keyIdea: `Identify initial states, boundary conditions, and primary governing equations before attempting complex problem solving.`,
        remember: `Definitions and fundamental laws are the cornerstone of exam evaluation; state assumptions clearly.`,
        example: `Applying the principle under nominal conditions produces consistent, verifiable outcomes.`,
        sourceCitation: 'Source Section 1',
      },
      {
        id: 'chap-fb-2',
        chapterNumber: 2,
        chapterTitle: `Analytical Methods & Problem Solving`,
        mainConcept: `Translating theoretical statements into mathematical or logical models. Break down multi-variable scenarios into discrete, manageable steps.`,
        keyIdea: `Isolate dependent and independent variables to identify rate of change and equilibrium states.`,
        remember: `Always verify units and dimensional consistency when completing numerical or conceptual steps.`,
        example: `Evaluating boundary conditions at zero and infinity verifies mathematical validity.`,
        sourceCitation: 'Source Section 2',
      },
    ],
    definitions: [
      {
        term: title.split('—')[0].trim() || 'Primary Concept',
        definition: `The central phenomenon or theoretical structure analyzed in this material, characterized by specific boundary conditions and governing principles.`,
        sourceCitation: 'Source Section 1',
      },
      {
        term: 'Governing Law',
        definition: 'A formal relationship or equation that accurately describes the behavior of the system under specified conditions.',
        sourceCitation: 'Source Section 1',
      },
      {
        term: 'Equilibrium State',
        definition: 'A state in which opposing forces or influences are balanced, resulting in steady or predictable outcomes.',
        sourceCitation: 'Source Section 2',
      },
    ],
    formulas: [
      {
        name: 'Fundamental Relationship',
        formula: 'F_{net} = m \\cdot a \\quad \\text{or} \\quad \\Delta E = 0',
        explanation: 'Governing conservation or dynamical equation relevant to the topic analysis.',
        variables: [
          { symbol: 'F_{net}', meaning: 'Net applied magnitude', unit: 'SI Units' },
          { symbol: 'm', meaning: 'Inherent system parameter', unit: 'kg / standard' },
          { symbol: 'a', meaning: 'Rate of system response', unit: 'standard / s²' },
        ],
        sourceCitation: 'Source Reference',
      },
    ],
    questions: [
      {
        id: 'q-fb-1',
        type: 'short',
        question: `Define the primary governing principle of ${title} and state its significance.`,
        answerGuideline: `Clearly state the fundamental definition, identify the key variables involved, and describe the primary real-world application.`,
        marks: 2,
      },
      {
        id: 'q-fb-2',
        type: 'conceptual',
        question: `How do changes in initial conditions affect the final equilibrium or outcome in this system?`,
        answerGuideline: `Trace the progression from initial perturbation to final state, referencing the governing conservation or equilibrium law.`,
        marks: 3,
      },
      {
        id: 'q-fb-3',
        type: 'long',
        question: `Provide a detailed derivation and explanation for the standard problem-solving model used in ${title}.`,
        answerGuideline: `State all assumptions, show intermediate algebraic or logical steps, and verify the physical meaning of the result.`,
        marks: 5,
      },
    ],
    mcqs: generateFallbackMCQs(title, targetQuestionCount),
    flashcards: [
      {
        id: 'fc-fb-1',
        front: `What is the core definition of ${title}?`,
        back: `The fundamental academic concept describing the system's states, inputs, and governed transitions.`,
        topic: 'Core Definition',
      },
      {
        id: 'fc-fb-2',
        front: 'What is the most common examination pitfall for this topic?',
        back: 'Failing to isolate axes or neglecting boundary conditions during derivation.',
        topic: 'Exam Strategy',
      },
      {
        id: 'fc-fb-3',
        front: 'How is equilibrium verified in this domain?',
        back: 'By ensuring all opposing rates or vector components sum to zero.',
        topic: 'Verification',
      },
    ],
    revisionSheet: {
      fiveMinuteSummary: `Review the primary definition, check the governing equation, and verify the three standard exam questions before testing.`,
      quickTakeaways: [
        'Always establish a consistent reference frame before calculating.',
        'Units and dimensional analysis catch over 50% of arithmetic errors.',
        'State all simplifying assumptions at the beginning of written answers.',
      ],
      formulaCheatSheet: [
        { name: 'Core Equation', formula: 'Result = f(Inputs, Constants)' },
      ],
      commonPitfalls: [
        'Overlooking unit conversions (e.g. cm to meters, minutes to seconds).',
        'Confusing scalar quantities with directional vectors.',
      ],
    },
  };
}

function generateFallbackMCQs(title: string, count: number = 10) {
  const templates = [
    {
      q: `Which statement best describes the fundamental principle of ${title}?`,
      opts: [
        'It operates independently of external conditions',
        'It follows predictable governing equations under specified constraints',
        'It violates standard conservation principles',
        'It can only be analyzed under qualitative criteria',
      ],
      correct: 1,
      exp: 'Scientific and academic models rely on well-defined governing equations and explicit boundary constraints.',
      topic: 'Foundational Theory',
    },
    {
      q: 'When analyzing the system, what is the first critical step?',
      opts: [
        'Immediately guess the final numerical answer',
        'Identify knowns, unknowns, and coordinate frame',
        'Ignore initial conditions',
        'Assume zero resistance without basis',
      ],
      correct: 1,
      exp: 'Systematic problem solving requires isolating known parameters and choosing a consistent reference framework.',
      topic: 'Methodology',
    },
    {
      q: 'What happens to the response when the primary driving parameter is doubled?',
      opts: [
        'It is strictly unaffected',
        'It scales according to the mathematical order of the governing equation',
        'It drops to zero immediately',
        'It creates an indeterminate loop',
      ],
      correct: 1,
      exp: 'Linear equations scale 2x, quadratic equations scale 4x, showing direct dependence on equation degree.',
      topic: 'Parametric Scaling',
    },
    {
      q: 'Which quantity remains strictly conserved in an isolated state?',
      opts: ['Total mechanical energy / mass balance', 'Instantaneous velocity alone', 'Frictional heat loss', 'External force vector'],
      correct: 0,
      exp: 'Conservation laws state that total energy or mass remains constant unless acted upon by external net forces.',
      topic: 'Conservation Laws',
    },
    {
      q: 'What does a zero first derivative indicate on a response curve?',
      opts: ['A critical equilibrium point or extremum', 'Uniform acceleration', 'Undefined behavior', 'Total system failure'],
      correct: 0,
      exp: 'Where rate of change is zero, the tangent slope is flat, signifying a local maximum, minimum, or stationary point.',
      topic: 'Mathematical Analysis',
    },
    {
      q: 'How are boundary conditions applied in physical modeling?',
      opts: ['By evaluating behavior at constraints (e.g. t = 0, x = 0)', 'By multiplying by arbitrary factors', 'By omitting constant terms', 'By assuming infinite capacity'],
      correct: 0,
      exp: 'Boundary conditions evaluate the state at specific spatial or temporal limits to determine integration constants.',
      topic: 'Boundary Analysis',
    },
    {
      q: 'In dimensional analysis, terms added together must have:',
      opts: ['Identical physical dimensions', 'Opposite algebraic signs', 'Equal numerical constants', 'Zero exponents'],
      correct: 0,
      exp: 'The principle of dimensional homogeneity requires that every term in an addition or subtraction must share identical units.',
      topic: 'Dimensional Consistency',
    },
    {
      q: 'What does a negative sign typically indicate in a vector equation?',
      opts: ['Direction opposite to chosen positive reference axis', 'Imaginary numerical value', 'Invalid calculation', 'Loss of total energy'],
      correct: 0,
      exp: 'In vector kinematics and dynamics, the algebraic sign denotes orientation relative to the selected coordinate frame.',
      topic: 'Vector Dynamics',
    },
    {
      q: 'What is the primary danger of neglecting simplifying assumptions?',
      opts: ['Unwarranted complexity and invalid mathematical models', 'Zero decimal precision', 'Loss of source material', 'Inability to write notes'],
      correct: 0,
      exp: 'Without clearly stated assumptions, analytical solutions cannot be tested against empirical boundaries.',
      topic: 'Model Validation',
    },
    {
      q: 'How does doubling the system inertia/mass affect the acceleration under constant net force?',
      opts: ['Halves the acceleration (a = F/m)', 'Doubles the acceleration', 'Quadruples the acceleration', 'Leaves it unchanged'],
      correct: 0,
      exp: 'According to Newton second law a = F/m, acceleration is inversely proportional to mass.',
      topic: 'Inertia & Response',
    },
    {
      q: 'What is the standard unit of frequency in the SI system?',
      opts: ['Hertz (s⁻¹)', 'Joules (J)', 'Newtons (N)', 'Watts (W)'],
      correct: 0,
      exp: 'Frequency represents cycles per second, measured in Hertz (Hz).',
      topic: 'Units & Measurements',
    },
    {
      q: 'Which condition defines dynamic equilibrium?',
      opts: ['Forward and reverse rates are equal and non-zero', 'All reactions have stopped completely', 'Mass has converted entirely into energy', 'Net force is infinite'],
      correct: 0,
      exp: 'Dynamic equilibrium occurs when opposing processes occur at identical rates simultaneously.',
      topic: 'Equilibrium Theory',
    },
    {
      q: 'True or False: A body can have zero velocity while experiencing non-zero acceleration.',
      opts: ['True (e.g. at the apex of vertical throw)', 'False (acceleration requires speed)', 'Only in empty space', 'Only at absolute zero'],
      correct: 0,
      exp: 'At the highest point of a vertical toss, instantaneous velocity is zero while gravity continuously accelerates it downward at 9.8 m/s².',
      topic: 'Kinematic Concepts',
    },
    {
      q: 'What type of error is minimized by repeating trials and computing an arithmetic mean?',
      opts: ['Random statistical fluctuations', 'Systematic calibration offset', 'Theoretical omission', 'Zero scale error'],
      correct: 0,
      exp: 'Averaging independent measurements reduces Gaussian random noise, though systematic bias remains unaffected.',
      topic: 'Error Analysis',
    },
    {
      q: 'Which representation is best suited for showing proportionality across multiple orders of magnitude?',
      opts: ['Logarithmic scaling', 'Linear bar charts', 'Pie diagrams', 'Qualitative sketches'],
      correct: 0,
      exp: 'Logarithmic plots condense exponential relationships into manageable linear visualization scales.',
      topic: 'Graphical Analysis',
    },
    {
      q: 'What is the relationship between work done and kinetic energy in an isolated system?',
      opts: ['Work-Energy Theorem: Net Work equals Change in Kinetic Energy', 'Work is always double the kinetic energy', 'Work only converts into heat', 'There is no formal relationship'],
      correct: 0,
      exp: 'The Work-Energy Theorem states that net external work done on a particle equals its net change in kinetic energy: W_net = ΔK.',
      topic: 'Energy Theorems',
    },
    {
      q: 'When solving a multi-step problem, what should be done after reaching a final number?',
      opts: ['Check order of magnitude, units, and physical reasonableness', 'Immediately close the book', 'Discard intermediate notes', 'Recalculate with arbitrary numbers'],
      correct: 0,
      exp: 'Sanity checks on physical realism and unit balance catch the majority of exam errors.',
      topic: 'Problem Verification',
    },
    {
      q: 'What is the derivative of position with respect to time?',
      opts: ['Instantaneous velocity', 'Acceleration', 'Jerk', 'Momentum'],
      correct: 0,
      exp: 'Velocity is defined mathematically as the first time derivative of displacement: v(t) = dx/dt.',
      topic: 'Calculus Kinematics',
    },
    {
      q: 'What is the derivative of velocity with respect to time?',
      opts: ['Acceleration', 'Jerk', 'Work', 'Potential Energy'],
      correct: 0,
      exp: 'Acceleration is the instantaneous rate of change of velocity: a(t) = dv/dt.',
      topic: 'Calculus Kinematics',
    },
    {
      q: 'Why do complementary projection angles result in equal horizontal range over flat terrain?',
      opts: ['sin(2θ) = sin(180° - 2θ) gives identical trigonometric values', 'Gravity is zero at 45 degrees', 'Air drag equalizes speed', 'Flight times are equal'],
      correct: 0,
      exp: 'Since sin(2(90 - θ)) = sin(180 - 2θ) = sin(2θ), complementary angles yield identical range R.',
      topic: 'Trigonometric Symmetry',
    },
    {
      q: 'True or False: Kinetic energy can be negative.',
      opts: ['False (scalar quantity proportional to squared speed)', 'True (when moving backward)', 'True in non-inertial frames', 'Only for negative charges'],
      correct: 0,
      exp: 'Because K = 1/2 m v^2 and both m and v^2 are non-negative, kinetic energy is strictly positive or zero.',
      topic: 'Energy Dynamics',
    },
    {
      q: 'Which principle governs fluid continuity in closed conduits?',
      opts: ['Conservation of Mass: A1·v1 = A2·v2', 'Bernoulli friction factor', 'Coulomb law of attraction', 'Hooke spring law'],
      correct: 0,
      exp: 'The continuity equation expresses mass conservation for incompressible fluids.',
      topic: 'Fluid Mechanics',
    },
    {
      q: 'In an elastic collision between two bodies, what quantities are conserved?',
      opts: ['Both total linear momentum and total kinetic energy', 'Momentum only, kinetic energy is lost', 'Kinetic energy only', 'Neither momentum nor energy'],
      correct: 0,
      exp: 'By definition, perfectly elastic collisions conserve both mechanical momentum and kinetic energy.',
      topic: 'Collision Dynamics',
    },
    {
      q: 'What happens to the period of a simple pendulum if its bob mass is doubled?',
      opts: ['It remains unchanged (T depends on length and g, not mass)', 'It doubles', 'It is halved', 'It increases by √2'],
      correct: 0,
      exp: 'T = 2π√(L/g). The period is strictly independent of the mass of the bob.',
      topic: 'Oscillations',
    },
    {
      q: 'What is the slope of a velocity-time graph equal to?',
      opts: ['Instantaneous acceleration', 'Total displacement', 'Power', 'Kinetic energy'],
      correct: 0,
      exp: 'The slope Δv/Δt of a velocity-time curve represents instantaneous acceleration.',
      topic: 'Graphical Kinematics',
    },
  ];

  const total = Math.max(10, Math.min(25, count));
  return templates.slice(0, total).map((item, idx) => ({
    id: `mcq-fb-${idx + 1}`,
    question: item.q,
    options: item.opts,
    correctIndex: item.correct,
    explanation: item.exp,
    topic: item.topic,
  }));
}

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev, attach Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DASTANAY server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
