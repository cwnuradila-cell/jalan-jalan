import React, { useState } from 'react';
import { Question } from '../types/game';
import { ZONES } from '../data/questionsData';
import { CheckCircle2, AlertCircle, Sparkles, X, RotateCcw, ArrowRight } from 'lucide-react';
import { sound } from '../audio/soundEffects';

interface QuestionModalProps {
  question: Question;
  isAlreadyAnswered: boolean;
  onAnswer: (isCorrect: boolean) => void;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  isAlreadyAnswered,
  onAnswer,
  onClose,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const zone = ZONES[question.zoneId];

  const handleSelectOption = (index: number) => {
    if (answeredState === 'correct') return;
    setSelectedIdx(index);
    const chosen = question.options[index];

    if (chosen.isCorrect) {
      setAnsweredState('correct');
      onAnswer(true);
    } else {
      setAnsweredState('wrong');
      sound.playWrong();
      onAnswer(false);
    }
  };

  const handleRetry = () => {
    setSelectedIdx(null);
    setAnsweredState('idle');
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden transform transition-all duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Mario '?' Block & Zone Badge */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${zone.themeColor} text-white flex items-center justify-between border-b-4 border-amber-300`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-amber-950 font-black text-2xl shadow-inner font-['Fredoka',sans-serif]">
              ?
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white/95">
                {zone.badgeIcon} {zone.name} • Misi {question.stationIndex}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Fredoka',sans-serif]">{question.title}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            aria-label="Tutup"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Question Text */}
          <div className="text-slate-800 font-bold text-base sm:text-lg leading-relaxed">
            {question.questionText}
          </div>

          {/* Blank Sentence Display */}
          {question.blankSentence && (
            <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 text-slate-900 font-semibold text-lg sm:text-xl text-center shadow-inner">
              {question.blankSentence.split('_______').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block px-3 py-1 mx-1.5 bg-white border-2 border-dashed border-amber-400 rounded-lg text-amber-700 font-extrabold text-xl animate-pulse">
                      {selectedIdx !== null ? question.options[selectedIdx].text : '_______'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {question.options.map((opt, idx) => {
              let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-800';

              if (selectedIdx === idx) {
                if (opt.isCorrect) {
                  btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-102';
                } else {
                  btnStyle = 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/30';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={answeredState === 'correct'}
                  className={`p-4 rounded-2xl border-3 font-extrabold text-base sm:text-lg transition-all duration-200 text-left flex items-center justify-between cursor-pointer ${btnStyle} active:scale-98`}
                >
                  <span className="flex-1">{opt.text}</span>
                  {selectedIdx === idx && (
                    opt.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-white shrink-0 ml-2 animate-bounce" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-white shrink-0 ml-2" />
                    )
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback: Correct */}
          {answeredState === 'correct' && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-lg">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                <span>Jawapan Tepat! {!isAlreadyAnswered ? '+10 Mata Diperoleh! 🎉' : 'Mata telah direkodkan.'}</span>
              </div>
              <p className="text-sm sm:text-base text-emerald-900 font-medium">
                {question.explanation}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <span>Teruskan Misi</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Feedback: Wrong */}
          {answeredState === 'wrong' && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-base">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Kurang Tepat, Cuba Lagi!</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 font-semibold bg-white/70 p-2.5 rounded-xl border border-amber-200">
                💡 <span className="font-bold">Petunjuk Pintar:</span> {question.hint}
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleRetry}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center space-x-1.5"
                >
                  <RotateCcw size={16} />
                  <span>Cuba Semula</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
