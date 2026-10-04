import React, { useState } from 'react';
import { 
  Layers, 
  RotateCw, 
  Check, 
  AlertCircle, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Filter
} from 'lucide-react';
import { StudyPack, FlashcardItem } from '../types';

interface FlashcardEngineViewProps {
  pack: StudyPack;
  onBackToPack: () => void;
}

export const FlashcardEngineView: React.FC<FlashcardEngineViewProps> = ({
  pack,
  onBackToPack,
}) => {
  const [cards, setCards] = useState<FlashcardItem[]>(pack.flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'difficult'>('all');

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
      setCurrentIndex(0);
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
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMastered: !c.isMastered } : c))
    );
  };

  const toggleDifficult = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDifficult: !c.isDifficult } : c))
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <button
            onClick={onBackToPack}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer mb-1 inline-flex items-center gap-1"
          >
            ← Back to {pack.title}
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Interactive Flashcards</span>
          </h1>
        </div>

        {/* Shuffle & Filter Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1 cursor-pointer"
            title="Shuffle cards"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={() => {
              setFilterMode(filterMode === 'all' ? 'difficult' : 'all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border inline-flex items-center gap-1 cursor-pointer transition-colors ${
              filterMode === 'difficult'
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterMode === 'difficult' ? 'Difficult Only' : 'All Cards'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>
          Card {currentIndex + 1} of {activeCards.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 font-semibold">
            {cards.filter((c) => c.isMastered).length} Mastered
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-700 font-semibold">
            {cards.filter((c) => c.isDifficult).length} Difficult
          </span>
        </div>
      </div>

      {/* Flashcard Component */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleFlip()}
        className="w-full min-h-[300px] sm:min-h-[340px] bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs cursor-pointer select-none flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm relative group"
      >
        {/* Card Top Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isFlipped ? 'Answer' : 'Question'} · {currentCard.topic}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => toggleDifficult(currentCard.id, e)}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                currentCard.isDifficult
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-slate-400 hover:bg-slate-100'
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
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="Mark as mastered"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Center Content */}
        <div className="py-6 text-center my-auto">
          {!isFlipped ? (
            <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
              {currentCard.front}
            </h2>
          ) : (
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed font-sans">
              {currentCard.back}
            </p>
          )}
        </div>

        {/* Card Bottom Hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Tap anywhere to {isFlipped ? 'show question' : 'reveal answer'}</span>
          </span>
          <span className="font-mono">{currentIndex + 1} / {activeCards.length}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleFlip}
          className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          {isFlipped ? 'Flip to Front' : 'Reveal Answer'}
        </button>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
