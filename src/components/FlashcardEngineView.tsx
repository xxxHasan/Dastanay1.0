import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  RotateCw, 
  Check, 
  AlertCircle, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Filter,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { StudyPack, FlashcardItem } from '../types';

interface FlashcardEngineViewProps {
  pack: StudyPack;
  onBackToPack: () => void;
  onUpdateFlashcards?: (updatedCards: FlashcardItem[]) => void;
}

export const FlashcardEngineView: React.FC<FlashcardEngineViewProps> = ({
  pack,
  onBackToPack,
  onUpdateFlashcards,
}) => {
  const [cards, setCards] = useState<FlashcardItem[]>(pack.flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'difficult'>('all');
  const [isDeckFinished, setIsDeckFinished] = useState(false);

  const filteredCards = cards.filter((c) =>
    filterMode === 'difficult' ? c.isDifficult : true
  );

  const activeCards = filteredCards.length > 0 ? filteredCards : cards;
  const currentCard = activeCards[currentIndex] || cards[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsDeckFinished(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(activeCards.length - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsDeckFinished(false);
  };

  const toggleMastered = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = cards.map((c) =>
      c.id === id ? { ...c, isMastered: !c.isMastered } : c
    );
    setCards(updated);
    if (onUpdateFlashcards) onUpdateFlashcards(updated);
  };

  const toggleDifficult = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = cards.map((c) =>
      c.id === id ? { ...c, isDifficult: !c.isDifficult } : c
    );
    setCards(updated);
    if (onUpdateFlashcards) onUpdateFlashcards(updated);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleShuffle();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (currentCard) toggleMastered(currentCard.id);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (currentCard) toggleDifficult(currentCard.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, activeCards, currentCard]);

  const masteredCount = cards.filter((c) => c.isMastered).length;
  const difficultCount = cards.filter((c) => c.isDifficult).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={onBackToPack}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer mb-1 inline-flex items-center gap-1 transition-colors"
          >
            ← Back to {pack.title}
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Flashcards</span>
          </h1>
        </div>

        {/* Shuffle & Filter Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
            title="Shuffle cards (Shortcut: S)"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={() => {
              setFilterMode(filterMode === 'all' ? 'difficult' : 'all');
              setCurrentIndex(0);
              setIsFlipped(false);
              setIsDeckFinished(false);
            }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border inline-flex items-center gap-1 cursor-pointer transition-colors ${
              filterMode === 'difficult'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-semibold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterMode === 'difficult' ? 'Difficult Only' : 'All Cards'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <span>
          Card {currentIndex + 1} of {activeCards.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {masteredCount} Mastered
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-700 dark:text-amber-400 font-semibold">
            {difficultCount} Difficult
          </span>
        </div>
      </div>

      {/* DECK FINISHED SUMMARY */}
      {isDeckFinished ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xs text-center space-y-5 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Flashcard Deck Completed!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You reviewed all {activeCards.length} cards in this study pack.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto py-2">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono block">
                {masteredCount}
              </span>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                Mastered Cards
              </span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60">
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 font-mono block">
                {difficultCount}
              </span>
              <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                Marked Difficult
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setIsDeckFinished(false);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart All Cards</span>
            </button>

            {difficultCount > 0 && (
              <button
                onClick={() => {
                  setFilterMode('difficult');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setIsDeckFinished(false);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 rounded-lg cursor-pointer transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Review Difficult Only ({difficultCount})</span>
              </button>
            )}

            <button
              onClick={onBackToPack}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <span>Back to Study Pack</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3D Physical Flip Flashcard Component */
        <div className="perspective-1000 w-full min-h-[300px] sm:min-h-[340px]">
          <div
            onClick={handleFlip}
            role="button"
            tabIndex={0}
            aria-label={`Flashcard: ${isFlipped ? 'Answer' : 'Question'}. Press Space or Enter to flip.`}
            className={`w-full min-h-[300px] sm:min-h-[340px] transform-style-preserve-3d transition-transform duration-500 cursor-pointer select-none relative ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT FACE (QUESTION) */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Question · {currentCard.topic}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => toggleDifficult(currentCard.id, e)}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      currentCard.isDifficult
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Mark as difficult (Shortcut: D)"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleMastered(currentCard.id, e)}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      currentCard.isMastered
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Mark as mastered (Shortcut: M)"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="py-6 text-center my-auto">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {currentCard.front}
                </h2>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <span className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tap or press Space to reveal answer</span>
                </span>
                <span className="font-mono">{currentIndex + 1} / {activeCards.length}</span>
              </div>
            </div>

            {/* BACK FACE (ANSWER) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Answer · {currentCard.topic}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => toggleDifficult(currentCard.id, e)}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      currentCard.isDifficult
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                        : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title="Mark as difficult"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleMastered(currentCard.id, e)}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      currentCard.isMastered
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title="Mark as mastered"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="py-6 text-center my-auto">
                <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {currentCard.back}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800 pt-3">
                <span className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tap or press Space to show question</span>
                </span>
                <span className="font-mono">{currentIndex + 1} / {activeCards.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {!isDeckFinished && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
            title="Previous Card (Shortcut: Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleFlip}
            className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            {isFlipped ? 'Show Question' : 'Reveal Answer'}
          </button>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-xs cursor-pointer transition-colors"
            title="Next Card (Shortcut: Right Arrow)"
          >
            <span>{currentIndex === activeCards.length - 1 ? 'Finish Deck' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
