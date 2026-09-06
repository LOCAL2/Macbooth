import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Zap } from 'lucide-react';
import { MissionData, MissionChoice } from '../../types/game.js';
import { MacWindow } from '../ui/MacWindow.js';
import { soundEngine } from '../../services/soundEngine.js';

interface PasswordMissionProps {
  mission: MissionData;
  onAnswer: (choice: MissionChoice) => void;
  isAnswered: boolean;
  selectedChoice: MissionChoice | null;
  onNextMission: () => void;
}

export const PasswordMission: React.FC<PasswordMissionProps> = ({
  mission,
  onAnswer,
  isAnswered,
  selectedChoice,
  onNextMission,
}) => {
  const details = mission.scenarioDetails;
  const [activePreviewId, setActivePreviewId] = useState<string>(() => {
    return details?.passwordOptions?.[0]?.id || 'A';
  });

  useEffect(() => {
    if (details?.passwordOptions?.length > 0) {
      setActivePreviewId(details.passwordOptions[0].id);
    }
  }, [mission.id, details]);

  const currentOption =
    details?.passwordOptions?.find((p: any) => p.id === activePreviewId) ||
    details?.passwordOptions?.[0] || {
      text: '—',
      type: 'N/A',
      strength: 0,
      crackTime: 'N/A',
      entropy: 0,
    };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Password Analyzer Terminal */}
      <MacWindow
        title="iCloud Keychain — เครื่องมือวิเคราะห์ความแข็งแกร่งรหัสผ่าน"
        subtitle="Cryptographic Strength Lab"
        icon={<Key className="w-4 h-4 text-apple-green" />}
        isThreatElevated={isAnswered && selectedChoice ? !selectedChoice.isCorrect : false}
        statusBadge={
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-apple-green/20 text-apple-green border border-apple-green/30 flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3 h-3" /> ทดสอบความปลอดภัย (ENTROPY LAB)
          </span>
        }
      >
        <div className="bg-[#0b0e14] rounded-xl p-4 sm:p-6 border border-white/5 space-y-5 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-xs uppercase text-apple-gray-400 font-sans">กำลังทดสอบรหัสผ่านตัวอย่าง:</span>
              <div className="text-xl sm:text-2xl font-black text-white tracking-widest mt-0.5">
                {currentOption.text}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase text-apple-gray-400 font-sans">รูปแบบโครงสร้าง</span>
              <div className="text-xs font-bold text-apple-teal font-sans">{currentOption.type}</div>
            </div>
          </div>

          {/* Password Strength Meter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-apple-gray-400 font-bold uppercase font-sans">ระดับความปลอดภัย (PASSWORD STRENGTH)</span>
              <span
                className={`font-black tracking-wider ${
                  currentOption.strength >= 80
                    ? 'text-apple-green glow-text-green'
                    : currentOption.strength >= 40
                    ? 'text-apple-amber'
                    : 'text-apple-red glow-text-red'
                }`}
              >
                {currentOption.strength >= 80
                  ? 'แข็งแกร่งมาก / ปลอดภัยสูง (STRONG)'
                  : currentOption.strength >= 40
                  ? 'ปานกลาง / มีความเสี่ยง (MODERATE)'
                  : 'อันตราย / ถูกเจาะได้ทันที (CRITICAL)'}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-500 ${
                  currentOption.strength >= 80
                    ? 'bg-apple-green shadow-glow-green'
                    : currentOption.strength >= 40
                    ? 'bg-apple-amber'
                    : 'bg-apple-red'
                }`}
                style={{ width: `${currentOption.strength}%` }}
              />
            </div>

            {/* ASCII Meter */}
            <div className="text-[11px] text-apple-gray-500 tracking-tighter">
              {'█'.repeat(Math.round(currentOption.strength / 5))}
              {'░'.repeat(20 - Math.round(currentOption.strength / 5))} ({currentOption.strength}%)
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-[#06080d] p-3 rounded-lg border border-white/5">
              <span className="text-[10px] text-apple-gray-400 uppercase font-sans">เวลาที่แฮกเกอร์/Botnet ใช้ถอดรหัส</span>
              <div
                className={`text-sm font-bold mt-0.5 font-sans ${
                  currentOption.strength >= 80 ? 'text-apple-green' : 'text-apple-red'
                }`}
              >
                ⏳ {currentOption.crackTime}
              </div>
            </div>
            <div className="bg-[#06080d] p-3 rounded-lg border border-white/5">
              <span className="text-[10px] text-apple-gray-400 uppercase font-sans">ค่าความซับซ้อน (Entropy Score)</span>
              <div className="text-sm font-bold text-apple-teal mt-0.5">
                ⚡ ~{currentOption.entropy} bits
              </div>
            </div>
          </div>
        </div>
      </MacWindow>

      {/* Decision Question & Interactive Choices */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-green animate-pulse shrink-0"></span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {mission.question}
            </h3>
          </div>

          {isAnswered && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onNextMission();
              }}
              className="self-end sm:self-auto shrink-0 px-4 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-glow-blue transition cursor-pointer"
            >
              <span>เข้าสู่ด่านถัดไป</span> <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Choices */}
        <div className="grid grid-cols-1 gap-3 font-mono">
          {mission.choices.map((choice) => {
            const isSelected = selectedChoice?.id === choice.id;
            const optionData = details.passwordOptions.find((p: any) => p.id === choice.id);
            let btnClass = 'border-white/10 bg-white/5 hover:bg-white/10 text-apple-gray-200';

            if (isAnswered) {
              if (choice.isCorrect) {
                btnClass = 'border-apple-green bg-apple-green/15 text-apple-green shadow-glow-green font-bold';
              } else if (isSelected && !choice.isCorrect) {
                btnClass = 'border-apple-red bg-apple-red/20 text-apple-red shadow-glow-red font-bold';
              } else {
                btnClass = 'opacity-40 border-white/5 bg-white/5';
              }
            }

            return (
              <div
                key={choice.id}
                onMouseEnter={() => !isAnswered && setActivePreviewId(choice.id)}
                className={`w-full p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${btnClass}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    disabled={isAnswered}
                    onClick={() => {
                      soundEngine.playClick();
                      onAnswer(choice);
                    }}
                    className="text-left flex-1 font-bold text-sm tracking-wide text-white hover:text-apple-teal cursor-pointer"
                  >
                    {choice.label}
                  </button>
                  {optionData && (
                    <span className="text-[10px] text-apple-gray-400 font-normal px-2 py-0.5 rounded bg-white/5 hidden md:inline font-sans">
                      {optionData.type}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {!isAnswered && (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setActivePreviewId(choice.id);
                      }}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] text-apple-teal border border-white/10 flex items-center gap-1 cursor-pointer font-sans"
                    >
                      <Zap className="w-3 h-3" /> ทดสอบความปลอดภัย
                    </button>
                  )}
                  {isAnswered && choice.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-apple-green flex-shrink-0" />
                  )}
                  {isAnswered && isSelected && !choice.isCorrect && (
                    <XCircle className="w-5 h-5 text-apple-red flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback & Debrief */}
        {isAnswered && selectedChoice && (
          <div
            className={`p-4 rounded-xl border animate-fadeIn ${
              selectedChoice.isCorrect
                ? 'bg-apple-green/10 border-apple-green/30 text-apple-green'
                : 'bg-apple-red/10 border-apple-red/30 text-apple-red'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs sm:text-sm mb-1">
              <span>{selectedChoice.isCorrect ? '✓ เลือกใช้วลีรหัสผ่าน (Passphrase) แข็งแกร่งยอดเยี่ยม' : '⚠ รหัสผ่านไม่ปลอดภัย ถูกแฮกได้ง่าย'}</span>
              <span className="font-mono text-xs">
                {selectedChoice.scoreBonus > 0 ? `+${selectedChoice.scoreBonus.toLocaleString()} SCORE` : `${selectedChoice.scoreBonus.toLocaleString()} SCORE`}
              </span>
            </div>
            <p className="text-xs text-apple-gray-200 mt-1 leading-relaxed font-sans">
              {selectedChoice.explanation}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-apple-gray-400 font-sans">
              💡 <strong>กฎความปลอดภัย:</strong> {mission.learningDebrief}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
