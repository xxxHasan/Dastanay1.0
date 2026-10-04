import React, { useState } from 'react';
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

  // If initialAttempt is provided, we can start in review mode or take quiz
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
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (index: number) => {
    if (isCompleted) return;
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

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const weakTopics = Object.keys(weakMap);
    const strongTopics = Object.keys(strongMap).filter((t) => !weakMap[t]);

    const generatedPlan: RevisionPlan = {
      id: `rev-${Date.now()}`,
      totalMinutes: 20,
      diagnosticSummary: weakTopics.length > 0
        ? `You demonstrated solid command of ${strongTopics.slice(0, 2).join(' and ') || 'fundamental laws'}, but had difficulty with ${weakTopics.join(', ')}.`
        : 'Outstanding performance across all tested topics! Use this 20-minute slot for advanced application and numerical verification.',
      blocks: [
        {
          timeRange: '0–5 min',
          title: 'Review Core Formulas & Definitions',
          focus: weakTopics[0] || 'Foundational Principles',
          actionItems: [
            `Check governing equations for ${weakTopics[0] || 'key kinematics'}.`,
            'Verify exact units and variable definitions.',
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

    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    setActivePlan(null);
  };

  // Compute results
  let correctCount = 0;
  questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctIndex) correctCount++;
  });
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <button
            onClick={onBackToPack}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer mb-1 inline-flex items-center gap-1"
          >
            ← Back to {pack.title}
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Practice Quiz & Diagnostic Assessment</span>
          </h1>
        </div>
        {isCompleted && (
          <button
            onClick={handleRetake}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>
        )}
      </div>

      {/* QUIZ IN PROGRESS MODE */}
      {!isCompleted && currentQ && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="font-semibold text-slate-900">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="tabular-nums">{progressPercent}% Completed</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Topic Badge */}
          <div className="text-xs font-medium text-slate-400">
            <span>Topic: </span>
            <span className="text-slate-700 font-semibold">{currentQ.topic}</span>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
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
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isSelected ? 'font-semibold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation & Submit Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-xs font-medium text-slate-600 disabled:opacity-30 disabled:pointer-events-none hover:text-slate-900 cursor-pointer"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQ.id] === undefined}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
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
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
              Quiz Completed
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {scorePercent}%
            </h2>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <strong className="text-slate-900">{correctCount}</strong> Correct
              </span>
              <span className="w-px h-4 bg-slate-200" aria-hidden="true" />
              <span className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <strong className="text-slate-900">{totalQuestions - correctCount}</strong> Wrong
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {scorePercent >= 80
                ? 'Strong subject mastery! You handled complex dynamics with precision.'
                : 'Good effort! Review the diagnostic weak areas below to target your next study session.'}
            </p>
          </div>

          {/* Question-by-Question Diagnostic Review */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
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
                      isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span className="font-bold text-slate-900 font-mono">Question {idx + 1}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{q.topic}</span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold font-mono ${
                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isCorrect ? '+1 Mark' : '0 Marks'}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 leading-snug">{q.question}</p>

                    <div className="text-[11px] space-y-1 text-slate-600">
                      <div>
                        <span>Your choice: </span>
                        <span className={isCorrect ? 'font-semibold text-emerald-800' : 'font-semibold text-rose-800'}>
                          {userChoice !== undefined ? q.options[userChoice] : 'Not answered'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span>Correct answer: </span>
                          <span className="font-semibold text-emerald-800">
                            {q.options[q.correctIndex]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-600 uppercase text-[10px] block mb-0.5">
                        Explanation:
                      </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personalized 20-Minute Revision Plan Section */}
          {activePlan && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalized Revision</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    20-Minute Diagnostic Revision Plan
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {activePlan.diagnosticSummary}
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-mono text-xs font-bold rounded-lg shrink-0">
                  20 MIN TOTAL
                </div>
              </div>

              {/* Time Blocks */}
              <div className="space-y-4">
                {activePlan.blocks.map((block, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {block.timeRange}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {block.title}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Focus: {block.focus}
                      </span>
                    </div>

                    <ul className="space-y-1.5 pt-1 text-xs text-slate-700">
                      {block.actionItems.map((act, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onBackToPack}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Return to Study Pack
                </button>
                <button
                  onClick={handleRetake}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
