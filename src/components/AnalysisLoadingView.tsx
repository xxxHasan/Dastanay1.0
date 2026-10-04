import React, { useState, useEffect } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

interface AnalysisLoadingViewProps {
  title: string;
  subject: string;
}

export const AnalysisLoadingView: React.FC<AnalysisLoadingViewProps> = ({
  title,
  subject,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const stages = [
    {
      title: 'Reading material',
      description: 'Extracting clean text and recognizing mathematical and scientific notation.',
    },
    {
      title: 'Understanding topics',
      description: 'Finding the important ideas and removing unnecessary information.',
    },
    {
      title: 'Organizing concepts',
      description: 'Structuring chapters, identifying definitions, and isolating formulas with variables.',
    },
    {
      title: 'Creating study structure',
      description: 'Generating conceptual questions, short problem sets, and flashcards.',
    },
    {
      title: 'Preparing your study tools',
      description: 'Compiling 5-minute summary, practice quiz, and print-ready study guide.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / stages.length) * 100));

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mb-2">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Understanding your material...
          </h2>
          <p className="text-xs text-slate-500">
            {title} · {subject}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Analyzing & Synthesizing</span>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Stage Progression List */}
        <div className="space-y-3 pt-2">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div
                key={stage.title}
                className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${
                  isCurrent ? 'bg-indigo-50/60' : 'bg-transparent'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted && (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                    </div>
                  )}
                </div>

                <div>
                  <span
                    className={`block text-xs font-semibold ${
                      isCompleted
                        ? 'text-slate-900'
                        : isCurrent
                        ? 'text-indigo-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </span>
                  {isCurrent && (
                    <span className="block text-[11px] text-indigo-700/80 mt-0.5 leading-snug">
                      {stage.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Microcopy footer */}
        <p className="text-center text-[11px] text-slate-400 italic">
          "Finding the important ideas and removing unnecessary information."
        </p>
      </div>
    </div>
  );
};
