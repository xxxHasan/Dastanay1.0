import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Clock, 
  BookOpen, 
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudyPack, MCQItem, QuizAttempt, RevisionPlan } from '../types';

interface QuizEngineViewProps {
  pack: StudyPack;
  initialAttempt?: QuizAttempt | null;
  onSaveAttempt: (attempt: QuizAttempt) => void;
  onBackToPack: () => void;
}

export const QuizEngineView: React.FC<QuizEngineViewProps> = ({
  pack,
  initialAttempt = null,
  onSaveAttempt,
  onBackToPack,
}) => {
  const questions: MCQItem[] = pack.mcqs;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    initialAttempt?.selectedAnswers || {}
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(!!initialAttempt);
  const [activePlan, setActivePlan] = useState<RevisionPlan | null>(
    initialAttempt?.revisionPlan || null
  );

  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  const handleSelectOption = (index: number) => {
    if (isCompleted || !currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: index,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const finishQuiz = () => {
    let correctCount = 0;
    const weakMap: Record<string, number> = {};
    const strongMap: Record<string, number> = {};

    questions.forEach((q) => {
      const selected = selectedAnswers[q.id];
      if (selected === q.correctIndex) {
        correctCount++;
        strongMap[q.topic] = (strongMap[q.topic] || 0) + 1;
      } else {
        weakMap[q.topic] = (weakMap[q.topic] || 0) + 1;
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const weakTopics = Object.keys(weakMap);
    const strongTopics = Object.keys(strongMap).filter((t) => !weakMap[t]);

    const generatedPlan: RevisionPlan = {
      id: `rev-${Date.now()}`,
      totalMinutes: 20,
      diagnosticSummary: weakTopics.length > 0
        ? `You demonstrated solid command of ${strongTopics.slice(0, 2).join(' and ') || 'fundamental laws'}, but need targeted reinforcement in ${weakTopics.join(', ')}.`
        : 'Outstanding performance across all tested topics! Use this revision slot for advanced problem solving and derivation practice.',
      blocks: [
        {
          timeRange: '0–5 min',
          title: 'Review Core Formulas & Definitions',
          focus: weakTopics[0] || 'Foundational Principles',
          actionItems: [
            `Check governing equations for ${weakTopics[0] || 'key formulas'}.`,
            'Verify exact SI units and variable definitions.',
            'Note common calculation pitfalls.',
          ],
        },
        {
          timeRange: '5–12 min',
          title: 'Practice Concepts & Derivations',
          focus: weakTopics[1] || 'Symmetry & Trajectory',
          actionItems: [
            'Reread the Key Idea callouts in the study notes.',
            'Step through the theoretical reasoning without looking at answers.',
            'Test yourself with the definition flashcards.',
          ],
        },
        {
          timeRange: '12–20 min',
          title: 'Solve Targeted Questions',
          focus: 'Numerical & Conceptual Application',
          actionItems: [
            'Attempt the short examination questions again.',
            'Verify numerical values with proper decimal precision.',
            'Retake this quiz to confirm 100% mastery.',
          ],
        },
      ],
    };

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      packId: pack.id,
      date: new Date().toISOString(),
      totalQuestions,
      score: correctCount,
      percentage,
      selectedAnswers,
      weakTopics,
      strongTopics,
      revisionPlan: generatedPlan,
    };

    setIsCompleted(true);
    setActivePlan(generatedPlan);
    onSaveAttempt(attempt);

    if (percentage >= 80) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setActivePlan(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (!isCompleted && currentQ) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') handleSelectOption(0);
        else if (e.key === '2' || e.key === 'b' || e.key === 'B') handleSelectOption(1);
        else if (e.key === '3' || e.key === 'c' || e.key === 'C') handleSelectOption(2);
        else if (e.key === '4' || e.key === 'd' || e.key === 'D') handleSelectOption(3);
        else if (e.key === 'Enter' && selectedAnswers[currentQ.id] !== undefined) handleNext();
        else if (e.key === 'ArrowRight' && selectedAnswers[currentQ.id] !== undefined) handleNext();
        else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, currentQ, currentQuestionIndex, selectedAnswers]);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Questions in this Study Pack</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This study pack does not have multiple-choice questions yet.
        </p>
        <button
          onClick={onBackToPack}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg cursor-pointer"
        >
          Back to Study Pack
        </button>
      </div>
    );
  }

  const correctCount = questions.filter((q) => selectedAnswers[q.id] === q.correctIndex).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={onBackToPack}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer mb-1 inline-flex items-center gap-1 transition-colors"
          >
            ← Back to {pack.title}
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Practice Quiz: {pack.title}</span>
          </h1>
        </div>

        {isCompleted && (
          <button
            onClick={handleRetake}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>
        )}
      </div>

      {/* QUIZ ACTIVE TAKING MODE */}
      {!isCompleted && currentQ && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          {/* Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="font-semibold text-slate-900 dark:text-white">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="tabular-nums">{progressPercent}% Completed</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Topic Badge */}
          <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
            <span>Topic: </span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{currentQ.topic}</span>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
            {currentQ.question}
          </h2>

          {/* 4 Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isSelected
                        ? 'font-semibold text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation & Submit Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQ.id] === undefined}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish & Score' : 'Next Question'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* QUIZ RESULTS MODE */}
      {isCompleted && (
        <div className="space-y-6 animate-fade-in">
          {/* Score Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-4">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Quiz Completed
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {scorePercent}%
            </h2>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <strong className="text-slate-900 dark:text-white">{correctCount}</strong> Correct
              </span>
              <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
              <span className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <strong className="text-slate-900 dark:text-white">{totalQuestions - correctCount}</strong> Wrong
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {scorePercent >= 80
                ? 'Strong subject mastery! You demonstrated commanding precision across concepts and formulas.'
                : 'Good effort! Review the diagnostic weak areas below to target your next study session.'}
            </p>
          </div>

          {/* Diagnostic 20-Minute Revision Plan */}
          {activePlan && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Targeted 20-Minute Diagnostic Revision Plan
                  </h3>
                </div>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 font-mono">
                  {activePlan.totalMinutes} min
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {activePlan.diagnosticSummary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {activePlan.blocks.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                        {b.timeRange}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {b.focus}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {b.title}
                    </h4>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {b.actionItems.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question-by-Question Review */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Answer Review & Explanations
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                      isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span className="font-bold text-slate-900 dark:text-white font-mono">Question {idx + 1}</span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-slate-500 dark:text-slate-400">{q.topic}</span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold font-mono ${
                          isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {q.question}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isUserPick = userChoice === optIdx;
                        const isRightAnswer = q.correctIndex === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                              isRightAnswer
                                ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-800'
                                : isUserPick
                                ? 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-950 dark:text-rose-200 font-semibold border border-rose-300 dark:border-rose-800'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>{opt}</span>
                            {isRightAnswer && (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                                Correct Answer
                              </span>
                            )}
                            {isUserPick && !isRightAnswer && (
                              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-mono">
                                Your Pick
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-700/60">
                        <strong className="text-slate-800 dark:text-slate-200 mr-1 font-semibold">Explanation:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
