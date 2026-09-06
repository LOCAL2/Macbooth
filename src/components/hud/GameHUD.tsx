import React from 'react';
import { Shield, ShieldAlert, Zap, Clock, Volume2, VolumeX, Lightbulb } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine.js';
import { AppleLogo } from '../ui/AppleLogo.js';

interface GameHUDProps {
  missionNumber: number;
  totalMissions: number;
  missionTitle: string;
  timeRemaining: number;
  score: number;
  threatLevel: number; // 0 - 100
  combo: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUseHint: () => void;
  hintAvailable: boolean;
  difficulty: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  missionNumber,
  totalMissions,
  missionTitle,
  timeRemaining,
  score,
  threatLevel,
  combo,
  soundEnabled,
  onToggleSound,
  onUseHint,
  hintAvailable,
  difficulty,
}) => {
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isTimeCritical = timeRemaining <= 60;
  const isThreatCritical = threatLevel >= 75;
  const isThreatWarning = threatLevel >= 50 && threatLevel < 75;

  const getThreatLabel = () => {
    if (isThreatCritical) return 'วิกฤต!';
    if (isThreatWarning) return 'เฝ้าระวัง';
    return 'ปลอดภัย';
  };

  const getDifficultyLabel = () => {
    if (difficulty === 'easy') return 'ระดับง่าย';
    if (difficulty === 'nightmare') return 'ฝันร้าย';
    return 'ระดับปกติ';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel-elevated border-b border-white/10 px-3 sm:px-6 py-2.5 shadow-2xl select-none font-mono">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: macOS Brand + Mission ID */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 mr-1">
            <span className="traffic-btn traffic-btn-close"></span>
            <span className="traffic-btn traffic-btn-min"></span>
            <span className="traffic-btn traffic-btn-max"></span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-glow-blue">
              <AppleLogo className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-white tracking-wider font-sans">
                  ด่าน {missionNumber}/{totalMissions}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-apple-blue/20 text-apple-teal border border-apple-blue/30 font-sans">
                  [{getDifficultyLabel()}]
                </span>
              </div>
              <p className="text-[11px] text-apple-gray-300 font-sans font-medium line-clamp-1">
                {missionTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Threat Meter + Combo */}
        <div className="flex-1 max-w-xs sm:max-w-sm flex flex-col justify-center px-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold mb-1 font-sans">
            <span className="text-apple-gray-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-apple-teal" /> ระดับภัยคุกคาม
            </span>
            <span
              className={`font-mono font-bold ${
                isThreatCritical
                  ? 'text-apple-red animate-pulse'
                  : isThreatWarning
                  ? 'text-apple-amber'
                  : 'text-apple-green'
              }`}
            >
              {getThreatLabel()} {threatLevel}%
            </span>
          </div>

          {/* Threat Gauge Bar */}
          <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative">
            <div
              className={`h-full transition-all duration-300 ${
                isThreatCritical
                  ? 'bg-apple-red shadow-glow-red'
                  : isThreatWarning
                  ? 'bg-apple-amber shadow-glow-amber'
                  : 'bg-apple-green shadow-glow-green'
              }`}
              style={{ width: `${Math.min(100, threatLevel)}%` }}
            />
          </div>
        </div>

        {/* Right: Score, Timer, Audio & Hint Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Combo Multiplier */}
          {combo > 1 && (
            <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-lg bg-apple-amber/20 border border-apple-amber/40 text-apple-amber text-xs font-black animate-bounce font-sans">
              <Zap className="w-3 h-3 fill-current" />
              <span>{combo}x คอมโบ</span>
            </div>
          )}

          {/* Current Score */}
          <div className="text-right">
            <span className="text-[9px] text-apple-gray-400 uppercase font-sans">คะแนน</span>
            <div className="text-sm sm:text-base font-black text-apple-teal glow-text-blue">
              {score.toLocaleString()}
            </div>
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border ${
              isTimeCritical
                ? 'bg-apple-red/20 border-apple-red/50 text-apple-red animate-pulse shadow-glow-red'
                : 'bg-black/40 border-white/10 text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-black tracking-wider">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Hint Trigger */}
          {hintAvailable && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onUseHint();
              }}
              className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-apple-amber/10 hover:bg-apple-amber/20 text-apple-amber border border-apple-amber/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer font-sans"
              title="ดูคำใบ้ความปลอดภัย"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden md:inline">คำใบ้</span>
            </button>
          )}

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-apple-gray-300 transition cursor-pointer"
            title={soundEnabled ? 'ปิดเสียงเกม' : 'เปิดเสียงเกม'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-apple-green" />
            ) : (
              <VolumeX className="w-4 h-4 text-apple-gray-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
