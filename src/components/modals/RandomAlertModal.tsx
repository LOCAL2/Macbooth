import React, { useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { RandomAlert } from '../../types/game.js';
import { soundEngine } from '../../services/soundEngine.js';

interface RandomAlertModalProps {
  alert: RandomAlert | null;
  onChoose: (isSafe: boolean, impact: number) => void;
}

export const RandomAlertModal: React.FC<RandomAlertModalProps> = ({ alert, onChoose }) => {
  if (!alert) return null;

  // Shuffle choice order so user cannot rely on button position
  const shuffledChoices = useMemo(() => {
    return [...alert.choices].sort(() => Math.random() - 0.5);
  }, [alert.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="max-w-md w-full glass-panel-elevated bg-[#0e121a]/95 rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-apple-teal">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-apple-teal font-mono uppercase font-bold tracking-wider">
                {alert.source}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white font-sans leading-tight">
                {alert.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-apple-gray-200 bg-black/50 p-3.5 rounded-xl border border-white/10 leading-relaxed font-sans">
          {alert.description}
        </p>

        {/* Action Choices - Zero giveaway hints, realistic macOS style */}
        <div className="space-y-2.5 pt-1 font-sans">
          {shuffledChoices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEngine.playClick();
                onChoose(choice.isSafe, choice.threatImpact);
              }}
              className="w-full text-left p-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 active:bg-white/20 text-white font-medium text-xs sm:text-sm transition-all duration-150 flex items-center justify-between cursor-pointer group shadow-sm hover:border-white/30"
            >
              <span className="group-hover:text-apple-teal transition-colors">{choice.label}</span>
              <span className="text-apple-gray-500 group-hover:text-white transition-colors text-xs font-mono ml-2">➔</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
