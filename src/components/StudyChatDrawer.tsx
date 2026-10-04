import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Globe, 
  BookOpen, 
  Trash2, 
  Plus, 
  ExternalLink, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { StudyPack, User } from '../types';
import { sendStudyChat } from '../services/api';
import { 
  ChatSession, 
  ChatMessage, 
  saveFirestoreChatSession, 
  getFirestoreChatSessions, 
  deleteFirestoreChatSession 
} from './../services/firebase';
import { DastanayLogo } from './DastanayLogo';

interface StudyChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePack?: StudyPack | null;
  user: User;
}

const LOCAL_CHAT_KEY = 'dastanay_local_chat_sessions_v1';

function getLocalChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalChatSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save local chats:', err);
  }
}

export const StudyChatDrawer: React.FC<StudyChatDrawerProps> = ({
  isOpen,
  onClose,
  activePack,
  user,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [forceSearchGrounding, setForceSearchGrounding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat sessions on mount or when user changes
  useEffect(() => {
    async function loadSessions() {
      if (user && !user.isGuest) {
        const remote = await getFirestoreChatSessions(user.id);
        if (remote.length > 0) {
          setSessions(remote);
          setActiveSessionId(remote[0].id);
          return;
        }
      }
      const local = getLocalChatSessions();
      setSessions(local);
      if (local.length > 0) {
        setActiveSessionId(local[0].id);
      } else {
        createNewChat();
      }
    }
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, user]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isLoading]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: activePack ? `Study: ${activePack.title.slice(0, 24)}` : 'General Study Q&A',
      studyPackId: activePack?.id,
      studyPackTitle: activePack?.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          content: activePack
            ? `I'm ready to study "${activePack.title}" with you. Ask me to simplify a concept, breakdown any formula, generate a practice question, or explain a difficult point.`
            : "I'm your DASTANAY Study Companion. What academic concept or subject are you studying today?",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);

    if (user && !user.isGuest) {
      saveFirestoreChatSession(user.id, newSession);
    } else {
      saveLocalChatSessions([newSession, ...sessions]);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);

    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        createNewChat();
      }
    }

    if (user && !user.isGuest) {
      await deleteFirestoreChatSession(user.id, sessionId);
    } else {
      saveLocalChatSessions(updated);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const currentMessages = activeSession ? [...activeSession.messages, userMessage] : [userMessage];

    // Optimistically update UI
    const updatedSession: ChatSession = {
      ...(activeSession || {
        id: `chat-${Date.now()}`,
        title: text.slice(0, 26),
        createdAt: new Date().toISOString(),
      }),
      title: activeSession && activeSession.messages.length > 1 ? activeSession.title : text.slice(0, 28),
      studyPackId: activePack?.id,
      studyPackTitle: activePack?.title,
      updatedAt: new Date().toISOString(),
      messages: currentMessages,
    };

    setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
    setIsLoading(true);

    try {
      // Build context from active study pack if present
      const contextPayload = activePack
        ? {
            studyPackTitle: activePack.title,
            subject: activePack.subject,
            difficulty: activePack.difficulty,
            summary: activePack.summary,
            chapters: activePack.chapters,
            formulas: activePack.formulas,
            definitions: activePack.definitions,
            sourceAttribution: activePack.sourceAttribution,
          }
        : null;

      const res = await sendStudyChat({
        messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
        context: contextPayload,
        forceSearch: forceSearchGrounding,
      });

      const modelMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toISOString(),
        isGrounded: res.isGrounded,
        groundingSources: res.sources,
      };

      const finalSession: ChatSession = {
        ...updatedSession,
        updatedAt: new Date().toISOString(),
        messages: [...currentMessages, modelMessage],
      };

      setSessions((prev) => prev.map((s) => (s.id === finalSession.id ? finalSession : s)));

      // Persist to Firestore or local
      if (user && !user.isGuest) {
        saveFirestoreChatSession(user.id, finalSession);
      } else {
        const all = getLocalChatSessions().filter((s) => s.id !== finalSession.id);
        saveLocalChatSessions([finalSession, ...all]);
      }
    } catch (err: any) {
      console.error('Chat request failed:', err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        content: "I couldn't reach the study analysis server right now. Please check your network and try again.",
        timestamp: new Date().toISOString(),
      };
      const finalSession = {
        ...updatedSession,
        messages: [...currentMessages, errorMessage],
      };
      setSessions((prev) => prev.map((s) => (s.id === finalSession.id ? finalSession : s)));
    } finally {
      setIsLoading(false);
      if (forceSearchGrounding) {
        setForceSearchGrounding(false); // Reset search toggle after one-off grounded search
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
        role="dialog"
        aria-label="Ask DASTANAY Study Chat"
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Chat History"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <DastanayLogo height={16} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">/</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Ask DASTANAY</span>
              </div>
              {activePack ? (
                <div className="flex items-center gap-1 text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5 truncate max-w-xs">
                  <BookOpen className="w-3 h-3 shrink-0" />
                  <span className="truncate">Context: {activePack.title}</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 block mt-0.5">Academic Study Assistant</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={createNewChat}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1"
              title="Start New Chat Session"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sessions Drawer (History slide-in) */}
        {showHistory && (
          <div className="bg-slate-100 dark:bg-slate-950 p-3 border-b border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
              <span>Saved Conversations</span>
              <span>{sessions.length} sessions</span>
            </div>
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setShowHistory(false);
                }}
                className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                  s.id === activeSession?.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 font-semibold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-900'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate">{s.title}</p>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer shrink-0"
                  title="Delete Conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeSession?.messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white dark:bg-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                  {/* Grounded Web Sources Display */}
                  {m.groundingSources && m.groundingSources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <Globe className="w-3 h-3" />
                        <span>Verified with Google Search Grounding:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {m.groundingSources.slice(0, 3).map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span className="truncate max-w-[160px]">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 px-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Analyzing study material...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills (Context-driven) */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto flex items-center gap-2 text-xs shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {[
            'Explain this simply',
            'Break down the governing formula',
            'Give me 2 practice questions',
            'Memory trick for key terms',
            'What is the latest Pakistan budget?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/90 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setForceSearchGrounding(!forceSearchGrounding)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                forceSearchGrounding
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Toggle Google Search Grounding for real-time web retrieval"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Search Grounding {forceSearchGrounding ? 'ON' : 'OFF'}</span>
            </button>

            <span className="text-[10px] text-slate-400">
              Shift + Enter for new line
            </span>
          </div>

          <div className="relative flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activePack ? `Ask a question about ${activePack.title}...` : "Ask a study question..."}
              className="flex-1 p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none dark:text-white"
            />

            <button
              type="button"
              disabled={!inputMessage.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="p-2.5 text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-30 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
