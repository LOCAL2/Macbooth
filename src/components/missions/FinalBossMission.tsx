import React, { useEffect, useState } from 'react';
import { Skull, CheckCircle2, XCircle, ArrowRight, Radio } from 'lucide-react';
import { MissionData, MissionChoice } from '../../types/game.js';
import { MacWindow } from '../ui/MacWindow.js';
import { soundEngine } from '../../services/soundEngine.js';

interface FinalBossMissionProps {
  mission: MissionData;
  onAnswer: (choice: MissionChoice) => void;
  isAnswered: boolean;
  selectedChoice: MissionChoice | null;
  onNextMission: () => void;
  onTimeOut?: () => void;
}

export const FinalBossMission: React.FC<FinalBossMissionProps> = ({
  mission,
  onAnswer,
  isAnswered,
  selectedChoice,
  onNextMission,
}) => {
  const details = mission.scenarioDetails;
  const [bossTimer, setBossTimer] = useState<number>(details?.timeLimitSeconds || 60);

  useEffect(() => {
    soundEngine.playBossPulse();
    soundEngine.startThreatAlarm();

    const interval = setInterval(() => {
      setBossTimer((prev: number) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        if (prev % 2 === 0) {
          soundEngine.playBossPulse();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      soundEngine.stopThreatAlarm();
    };
  }, []);

  useEffect(() => {
    if (isAnswered) {
      soundEngine.stopThreatAlarm();
    }
  }, [isAnswered]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Boss Incident Matrix Window */}
      <MacWindow
        title="ศูนย์บัญชาการความปลอดภัย macOS — การระงับเหตุโจมตีฉุกเฉิน (INCIDENT RESPONSE)"
        subtitle="Active Cyber Infiltration Underway"
        icon={<Skull className="w-4 h-4 text-apple-red animate-pulse" />}
        isThreatElevated={true}
        statusBadge={
          <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-apple-red text-white font-black flex items-center gap-1 animate-pulse shadow-glow-red">
            <Radio className="w-3.5 h-3.5 animate-spin" /> การบุกรุกระดับ 5 (LEVEL 5)
          </span>
        }
      >
        <div className="bg-[#140608] border-2 border-apple-red/50 rounded-xl p-5 sm:p-8 space-y-6 font-mono text-center relative overflow-hidden shadow-glow-red">
          {/* Header Banner */}
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded bg-apple-red/20 text-apple-red border border-apple-red/40 text-xs font-black tracking-widest uppercase animate-bounce font-sans">
              🚨 การระงับเหตุโจมตีแบบประสานงานหลายทิศทาง
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-wider glow-text-red font-sans">
              MAC ของคุณกำลังถูกโจมตีแบบเรียลไทม์
            </h1>
            <p className="text-xs text-apple-gray-300 font-sans">
              ระบบตรวจพบการบุกรุกพร้อมกันทั้งเครือข่าย พื้นที่จัดเก็บข้อมูล และบริการยืนยันตัวตน
            </p>
          </div>

          {/* Active Threat Vectors Grid */}
          <div className={`grid grid-cols-1 ${details?.threatVectors?.length > 3 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-3 text-left`}>
            {details?.threatVectors?.map((v: any) => (
              <div
                key={v.id}
                className="bg-black/60 border border-apple-red/30 p-3.5 rounded-xl space-y-1.5 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-apple-red text-white uppercase font-sans">
                    {v.severity}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-apple-red animate-ping" />
                </div>
                <div className="text-xs font-bold text-white tracking-tight font-sans">
                  {v.name}
                </div>
                <div className="text-[10px] text-apple-red font-bold">
                  {v.status}
                </div>
              </div>
            ))}
          </div>

          {/* Boss Countdown Display */}
          <div className="bg-[#080203] border border-apple-red/40 rounded-xl p-4 inline-block mx-auto">
            <div className="text-[10px] text-apple-gray-400 uppercase tracking-widest font-sans font-bold">
              หน้าต่างเวลาระงับเหตุฉุกเฉิน
            </div>
            <div className="text-3xl sm:text-5xl font-black text-apple-red tracking-widest glow-text-red">
              00:{String(bossTimer).padStart(2, '0')}
            </div>
          </div>
        </div>
      </MacWindow>

      {/* Incident Decision & Choices */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-red animate-ping"></span>
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
              className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-apple-green to-emerald-600 hover:from-emerald-500 hover:to-green-500 text-black font-black text-xs sm:text-sm tracking-wider shadow-glow-green flex items-center justify-center space-x-2 transition cursor-pointer font-sans flex-shrink-0"
            >
              <span>เสร็จสิ้นภารกิจ / FINISH INCIDENT</span>
              <ArrowRight className="w-4 h-4" />
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
                <div className="flex-1 font-sans">
                  <div className="font-semibold text-white mb-1">{choice.label}</div>
                  {isAnswered && (
                    <div
                      className={`text-xs mt-2 p-2.5 rounded-lg font-sans leading-relaxed ${
                        choice.isCorrect
                          ? 'bg-apple-green/10 text-apple-green border border-apple-green/30'
                          : isSelected
                          ? 'bg-apple-red/10 text-apple-red border border-apple-red/30'
                          : 'text-apple-gray-400'
                      }`}
                    >
                      {choice.explanation}
                    </div>
                  )}
                </div>

                {isAnswered && (
                  <div className="mt-1 flex-shrink-0">
                    {choice.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-apple-green" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-apple-red" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Debrief */}
        {isAnswered && (
          <div className="pt-3 border-t border-white/10 text-xs text-apple-gray-300 font-sans">
            <strong className="text-white">🛡️ การเรียนรู้:</strong> {mission.learningDebrief}
          </div>
        )}
      </div>
    </div>
  );
};
