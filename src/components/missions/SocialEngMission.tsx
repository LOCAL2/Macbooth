import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, PhoneCall, CheckCircle2, XCircle, ArrowRight, KeyRound, MessageSquare } from 'lucide-react';
import { MissionData, MissionChoice } from '../../types/game.js';
import { MacWindow } from '../ui/MacWindow.js';
import { soundEngine } from '../../services/soundEngine.js';

interface SocialEngMissionProps {
  mission: MissionData;
  onAnswer: (choice: MissionChoice) => void;
  isAnswered: boolean;
  selectedChoice: MissionChoice | null;
  onNextMission: () => void;
}

export const SocialEngMission: React.FC<SocialEngMissionProps> = ({
  mission,
  onAnswer,
  isAnswered,
  selectedChoice,
  onNextMission,
}) => {
  const details = mission.scenarioDetails;
  const [callAnswered] = useState(false);

  // Play phone ring on mount if not answered
  useEffect(() => {
    if (!isAnswered && !callAnswered) {
      soundEngine.playPhoneRing();
      const interval = setInterval(() => {
        if (!isAnswered && !callAnswered) {
          soundEngine.playPhoneRing();
        }
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isAnswered, callAnswered]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* High-Pressure FaceTime Audio Call Simulation */}
      <MacWindow
        title="FaceTime Audio — มีสายโทรเข้าฉุกเฉิน"
        subtitle="End-to-End Encrypted Tunnel"
        icon={<PhoneCall className="w-4 h-4 text-apple-green animate-bounce" />}
        isThreatElevated={isAnswered && selectedChoice ? !selectedChoice.isCorrect : true}
        statusBadge={
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-apple-amber/20 text-apple-amber border border-apple-amber/30 flex items-center gap-1 font-bold animate-pulse">
            <Phone className="w-3 h-3" /> สายเรียกเข้า (INCOMING CALL)
          </span>
        }
      >
        <div className="bg-[#0b0e14] rounded-xl p-5 sm:p-8 border border-white/5 space-y-6 font-sans relative overflow-hidden">
          {/* Caller Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-apple-red to-orange-500 flex items-center justify-center text-white shadow-glow-red animate-pulse">
                <PhoneCall className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs uppercase font-mono tracking-widest text-apple-red font-bold font-sans">
                  🚨 มีสายโทรเข้าเร่งด่วน
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight font-sans">
                  {details.callerName}
                </h2>
                <div className="text-xs font-mono text-apple-gray-400">
                  {details.callerNumber} • {details.callerSubtitle || 'Caller ID: "Enterprise IT SecOps"'}
                </div>
              </div>
            </div>

            {/* Simulated 2FA SMS Code Banner */}
            <div className="bg-[#151b27] border border-apple-teal/30 p-3 rounded-xl font-mono text-left text-xs max-w-xs shadow-lg">
              <div className="flex items-center space-x-1 text-apple-teal text-[10px] font-bold uppercase mb-1 font-sans">
                <MessageSquare className="w-3 h-3" /> ข้อความแจ้งเตือน • เมื่อสักครู่
              </div>
              <div className="text-apple-gray-200 font-sans">
                {details.codeLabel || 'รหัสยืนยัน Apple ID คือ:'} <strong className="text-white text-sm bg-black/40 px-1.5 py-0.5 rounded text-apple-teal font-mono">{details.verificationCode}</strong> (ห้ามเปิดเผยรหัสนี้แก่ผู้ใด)
              </div>
            </div>
          </div>

          {/* Voice Wave Animation & Live Transcript */}
          <div className="bg-[#06080d] p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-apple-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-apple-red animate-ping" /> เสียงสนทนาแบบเรียลไทม์ (LIVE TRANSCRIPT)
              </span>
              <span className="text-[10px] font-mono text-apple-red font-bold font-sans">ความกดดันสูง</span>
            </div>

            {/* Synthetic voice wave lines */}
            <div className="flex items-center justify-center space-x-1.5 h-8 py-1">
              {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 30, 95, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-apple-blue to-apple-teal rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
            </div>

            <p className="text-xs sm:text-sm text-apple-gray-200 font-sans italic leading-relaxed whitespace-pre-line border-l-2 border-apple-amber pl-3">
              {details.transcript}
            </p>
          </div>

          {/* Quick Call Action Simulation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono">
            <button
              disabled={isAnswered}
              onClick={() => {
                soundEngine.playError();
                const trapChoice =
                  mission.choices.find(
                    (c) =>
                      !c.isCorrect &&
                      (c.label.includes('บอก') ||
                        c.label.includes('อ่าน') ||
                        c.label.includes('ส่ง') ||
                        c.label.includes('โอน') ||
                        c.label.includes('ทำตาม'))
                  ) || mission.choices.find((c) => !c.isCorrect);
                if (trapChoice) onAnswer(trapChoice);
              }}
              className="px-5 py-3 rounded-xl bg-apple-red/20 hover:bg-apple-red/30 text-apple-red border border-apple-red/40 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer font-sans"
            >
              <KeyRound className="w-4 h-4" /> [ บอกรหัส / ดำเนินการตามที่ปลายสายขอ ]
            </button>

            <button
              disabled={isAnswered}
              onClick={() => {
                soundEngine.playSuccess();
                const safeChoice = mission.choices.find((c) => c.isCorrect);
                if (safeChoice) onAnswer(safeChoice);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-apple-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-xs sm:text-sm tracking-wide shadow-glow-green flex items-center gap-2 cursor-pointer font-sans"
            >
              <PhoneOff className="w-4 h-4" /> [ วางสายทันที & รายงานความปลอดภัย ]
            </button>
          </div>
        </div>
      </MacWindow>

      {/* Decision Question & Choices */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-amber animate-pulse shrink-0"></span>
            <h3 className="text-sm sm:text-base font-bold text-white font-sans">
              {mission.question}
            </h3>
          </div>

          {isAnswered && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onNextMission();
              }}
              className="self-end sm:self-auto shrink-0 px-4 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-glow-blue transition cursor-pointer font-sans"
            >
              <span>เข้าสู่ด่าน FINAL BOSS</span> <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Choices */}
        <div className="grid grid-cols-1 gap-3 font-mono">
          {mission.choices.map((choice) => {
            const isSelected = selectedChoice?.id === choice.id;
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
              <button
                key={choice.id}
                disabled={isAnswered}
                onClick={() => {
                  soundEngine.playClick();
                  onAnswer(choice);
                }}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all duration-200 flex items-start justify-between gap-3 cursor-pointer ${btnClass}`}
              >
                <span className="flex-1 font-sans">{choice.label}</span>
                {isAnswered && choice.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-apple-green flex-shrink-0" />
                )}
                {isAnswered && isSelected && !choice.isCorrect && (
                  <XCircle className="w-5 h-5 text-apple-red flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Debrief */}
        {isAnswered && selectedChoice && (
          <div
            className={`p-4 rounded-xl border animate-fadeIn ${
              selectedChoice.isCorrect
                ? 'bg-apple-green/10 border-apple-green/30 text-apple-green'
                : 'bg-apple-red/10 border-apple-red/30 text-apple-red'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs sm:text-sm mb-1">
              <span>{selectedChoice.isCorrect ? '✓ สกัดกั้นจิตวิทยาหลอกลวงสำเร็จ (SOCIAL ENGINEERING THWARTED)' : '🔴 บัญชีถูกแฮกขโมย (ACCOUNT COMPROMISED)'}</span>
              <span className="font-mono text-xs">
                {selectedChoice.scoreBonus > 0 ? `+${selectedChoice.scoreBonus.toLocaleString()} SCORE` : `${selectedChoice.scoreBonus.toLocaleString()} SCORE`}
              </span>
            </div>
            <p className="text-xs text-apple-gray-200 mt-1 leading-relaxed font-sans">
              {selectedChoice.explanation}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-apple-gray-400 font-sans">
              💡 <strong>บทเรียน Social Engineering:</strong> {mission.learningDebrief}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
