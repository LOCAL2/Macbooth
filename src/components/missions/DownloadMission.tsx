import React, { useState } from 'react';
import { Download, ShieldX, CheckCircle2, XCircle, ArrowRight, AlertOctagon, Globe } from 'lucide-react';
import { MissionData, MissionChoice } from '../../types/game.js';
import { MacWindow } from '../ui/MacWindow.js';
import { soundEngine } from '../../services/soundEngine.js';

interface DownloadMissionProps {
  mission: MissionData;
  onAnswer: (choice: MissionChoice) => void;
  isAnswered: boolean;
  selectedChoice: MissionChoice | null;
  onNextMission: () => void;
}

export const DownloadMission: React.FC<DownloadMissionProps> = ({
  mission,
  onAnswer,
  isAnswered,
  selectedChoice,
  onNextMission,
}) => {
  const details = mission.scenarioDetails;
  const [fakeInvestigateOpen, setFakeInvestigateOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Safari Browser Scareware Simulation Window */}
      <MacWindow
        title="Safari — หน้าต่างแจ้งเตือนจากเบราว์เซอร์"
        subtitle={details.siteUrl || "https://cleaner-pro-urgent-fix.top/warning"}
        icon={<Globe className="w-4 h-4 text-apple-blue" />}
        isThreatElevated={isAnswered && selectedChoice ? !selectedChoice.isCorrect : true}
        statusBadge={
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-apple-red/20 text-apple-red border border-apple-red/30 flex items-center gap-1 font-bold animate-pulse">
            <AlertOctagon className="w-3 h-3" /> ไวรัสหลอกลวง (FAKE VIRUS WARNING)
          </span>
        }
      >
        {/* Scareware Web Page Simulator */}
        <div className="bg-[#12080a] border border-apple-red/40 rounded-xl p-5 sm:p-8 text-center space-y-4 font-sans relative overflow-hidden shadow-glow-red">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-apple-red/20 text-apple-red border border-apple-red/30 text-xs font-bold font-mono">
            <ShieldX className="w-4 h-4 animate-bounce" />
            <span>CRITICAL MALWARE INFECTION DETECTED</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {details.programName}
            </h2>
            <div className="flex items-center justify-center space-x-1 text-apple-amber text-xs">
              <span>★★★★★</span>
              <span className="text-apple-gray-400 font-mono">(9,420 รีวิวปลอม)</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-apple-gray-300 max-w-lg mx-auto font-sans bg-black/40 p-3 rounded-lg border border-apple-red/20">
            {details.popupMessage}
          </p>

          {/* Fake Threat Items */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-lg mx-auto font-mono text-[11px] text-left">
            {details.fakeThreats.map((threat: string) => (
              <div key={threat} className="bg-apple-red/10 border border-apple-red/20 p-2 rounded text-apple-red flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-apple-red animate-ping" />
                {threat}
              </div>
            ))}
          </div>

          {/* Scareware Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 font-mono">
            <button
              disabled={isAnswered}
              onClick={() => {
                soundEngine.playError();
                const trapChoice =
                  mission.choices.find(
                    (c) =>
                      !c.isCorrect &&
                      (c.label.includes('ดาวน์โหลด') ||
                        c.label.includes('โหลด') ||
                        c.label.includes('ติดตั้ง') ||
                        c.label.includes('รัน') ||
                        c.label.includes('กรอก') ||
                        c.label.includes('คัดลอก'))
                  ) || mission.choices.find((c) => !c.isCorrect);
                if (trapChoice) onAnswer(trapChoice);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-apple-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-black text-xs sm:text-sm tracking-wider shadow-glow-red transition active:scale-95 flex items-center gap-2 cursor-pointer animate-pulse font-sans"
            >
              <Download className="w-4 h-4" /> {details.actionButtons?.[0] || 'ดาวน์โหลดทันที'}
            </button>

            <button
              disabled={isAnswered}
              onClick={() => {
                soundEngine.playSuccess();
                const safeChoice = mission.choices.find((c) => c.isCorrect);
                if (safeChoice) onAnswer(safeChoice);
              }}
              className="px-5 py-3 rounded-xl bg-apple-green/20 hover:bg-apple-green/30 text-apple-green border border-apple-green/40 font-bold text-xs sm:text-sm transition cursor-pointer font-sans"
            >
              {details.actionButtons?.[1] || 'ปิดแท็บ / ปฏิเสธ'}
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setFakeInvestigateOpen(!fakeInvestigateOpen);
              }}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-apple-teal border border-white/10 text-xs transition cursor-pointer font-sans"
            >
              {details.actionButtons?.[2] || 'ตรวจสอบความน่าเชื่อถือ'}
            </button>
          </div>

          {fakeInvestigateOpen && (
            <div className="bg-[#05070a] border border-apple-teal/30 p-3 rounded-lg text-left font-mono text-[11px] text-apple-teal animate-fadeIn max-w-lg mx-auto font-sans">
              {details.investigateResult || (
                <>
                  🔍 <strong>ผลการตรวจสอบ:</strong> หน้าเว็บ <span className="text-white font-mono">{details.siteUrl || 'หน้านี้'}</span> ไม่ใช่บริการของ Apple และเบราว์เซอร์ไม่มีสิทธิ์สแกนฮาร์ดดิสก์ Mac ได้จริง
                </>
              )}
            </div>
          )}
        </div>
      </MacWindow>

      {/* Decision Question & Choices */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-red animate-pulse shrink-0"></span>
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
              <span>เข้าสู่ด่านถัดไป</span> <ArrowRight className="w-4 h-4" />
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
              <span>{selectedChoice.isCorrect ? '✓ รู้ทัน Scareware ป้องกันไวรัสสำเร็จ' : '⚠ เผลอดาวน์โหลดมัลแวร์จากเว็บหลอกลวง'}</span>
              <span className="font-mono text-xs">
                {selectedChoice.scoreBonus > 0 ? `+${selectedChoice.scoreBonus.toLocaleString()} SCORE` : `${selectedChoice.scoreBonus.toLocaleString()} SCORE`}
              </span>
            </div>
            <p className="text-xs text-apple-gray-200 mt-1 leading-relaxed font-sans">
              {selectedChoice.explanation}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-apple-gray-400 font-sans">
              💡 <strong>กฎเหล็ก Scareware:</strong> {mission.learningDebrief}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
