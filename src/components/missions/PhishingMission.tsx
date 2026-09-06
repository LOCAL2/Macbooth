import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp, ShieldAlert, ArrowRight } from 'lucide-react';
import { MissionData, MissionChoice } from '../../types/game.js';
import { MacWindow } from '../ui/MacWindow.js';
import { soundEngine } from '../../services/soundEngine.js';

interface PhishingMissionProps {
  mission: MissionData;
  onAnswer: (choice: MissionChoice) => void;
  isAnswered: boolean;
  selectedChoice: MissionChoice | null;
  onNextMission: () => void;
}

export const PhishingMission: React.FC<PhishingMissionProps> = ({
  mission,
  onAnswer,
  isAnswered,
  selectedChoice,
  onNextMission,
}) => {
  const [showHeaders, setShowHeaders] = useState(false);
  const details = mission.scenarioDetails;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mail Application Simulation Window */}
      <MacWindow
        title="เมล — แจ้งเตือนความปลอดภัย Apple"
        subtitle="กล่องจดหมายเข้า (ยังไม่ได้อ่าน 1 ฉบับ)"
        icon={<Mail className="w-4 h-4 text-apple-blue" />}
        isThreatElevated={isAnswered && selectedChoice ? !selectedChoice.isCorrect : false}
        statusBadge={
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-apple-red/20 text-apple-red border border-apple-red/30 flex items-center gap-1 font-bold">
            <ShieldAlert className="w-3 h-3" /> อีเมลต้องสงสัย (SUSPICIOUS)
          </span>
        }
      >
        {/* Email Header Bar */}
        <div className="bg-[#0b0e14] rounded-xl p-4 border border-white/5 space-y-2.5 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span className="text-apple-red">🚨</span> {details.subject}
              </h1>
              <div className="flex items-center gap-2 text-xs text-apple-gray-400 mt-1">
                <span>จาก: <strong className="text-white">{details.senderName}</strong> &lt;{details.senderEmail}&gt;</span>
                <span className="text-apple-gray-600">•</span>
                <span>{details.receivedTime}</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setShowHeaders(!showHeaders);
              }}
              className="self-start sm:self-center px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-apple-teal border border-white/10 flex items-center gap-1 transition cursor-pointer"
            >
              {showHeaders ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showHeaders ? 'ซ่อนข้อมูลเชิงลึก' : 'ตรวจสอบ Mail Headers ทางเทคนิค'}
            </button>
          </div>

          {/* Expandable Technical Headers */}
          {showHeaders && (
            <div className="bg-[#07090e] p-3 rounded-lg border border-apple-blue/20 font-mono text-[11px] text-apple-gray-300 space-y-1 animate-fadeIn">
              <div className="text-apple-amber font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> ผลวิเคราะห์ความปลอดภัยของอีเมล (HEADER ANALYSIS):
              </div>
              <p><span className="text-apple-gray-500">Return-Path:</span> &lt;{details.replyTo}&gt; <span className="text-apple-red font-bold">(อีเมลตอบกลับไม่ตรงกับผู้ส่ง)</span></p>
              <p><span className="text-apple-gray-500">Sender Domain:</span> apple-security-example.com <span className="text-apple-red font-bold">(โดเมนปลอม ไม่ใช่ของ Apple)</span></p>
              <p><span className="text-apple-gray-500">SPF / DKIM:</span> FAIL (ไม่ผ่านการรับรองลายเซ็นดิจิทัลจาก Apple Inc.)</p>
              <p><span className="text-apple-gray-500">Target URL:</span> <span className="text-apple-teal break-all">{details.fakeLinkUrl}</span></p>
            </div>
          )}

          {/* Email Body */}
          <div className="pt-2 text-sm text-apple-gray-200 leading-relaxed whitespace-pre-line">
            {details.body}
          </div>

          {/* Simulated Phishing Verification Button */}
          <div className="pt-4 pb-2">
            <div className="inline-block relative group">
              <button
                disabled={isAnswered}
                onClick={() => {
                  const trapChoice =
                    mission.choices.find(
                      (c) =>
                        !c.isCorrect &&
                        (c.label.includes('คลิก') ||
                          c.label.includes('ลิงก์') ||
                          c.label.includes('Verify') ||
                          c.label.includes('ยืนยัน') ||
                          c.label.includes('กรอก') ||
                          c.label.includes('โหลด'))
                    ) || mission.choices.find((c) => !c.isCorrect);
                  if (trapChoice) onAnswer(trapChoice);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-apple-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-sm tracking-wide shadow-glow-blue transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {details.buttonText} <ArrowRight className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-[#05070a] border border-white/10 text-[10px] font-mono text-apple-teal p-1.5 rounded shadow-lg z-20 whitespace-nowrap">
                🔗 ลิงก์ปลายทาง: {details.fakeLinkUrl}
              </div>
            </div>
          </div>
        </div>
      </MacWindow>

      {/* Decision Question & Choices */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-blue animate-pulse shrink-0"></span>
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

        {/* Choices List */}
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

        {/* Educational Feedback */}
        {isAnswered && selectedChoice && (
          <div
            className={`p-4 rounded-xl border animate-fadeIn ${
              selectedChoice.isCorrect
                ? 'bg-apple-green/10 border-apple-green/30 text-apple-green'
                : 'bg-apple-red/10 border-apple-red/30 text-apple-red'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs sm:text-sm mb-1">
              <span>{selectedChoice.isCorrect ? '✓ ตรวจพบ Phishing สำเร็จ (+2,000 คะแนน)' : '⚠ ตกหลุมพราง Phishing (-1,000 คะแนน)'}</span>
              <span className="font-mono text-xs">
                {selectedChoice.scoreBonus > 0 ? `+${selectedChoice.scoreBonus.toLocaleString()} SCORE` : `${selectedChoice.scoreBonus.toLocaleString()} SCORE`}
              </span>
            </div>
            <p className="text-xs text-apple-gray-200 mt-1 leading-relaxed font-sans">
              {selectedChoice.explanation}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-apple-gray-400 font-sans">
              💡 <strong>บทเรียนสำคัญ:</strong> {mission.learningDebrief}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
