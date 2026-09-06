import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Camera, Mic, MapPin, Users, Image as ImageIcon } from 'lucide-react';
import { MissionData, MissionChoice } from '../../types/game.js';
import { MacWindow } from '../ui/MacWindow.js';
import { soundEngine } from '../../services/soundEngine.js';

interface PrivacyMissionProps {
  mission: MissionData;
  onAnswer: (choice: MissionChoice) => void;
  isAnswered: boolean;
  selectedChoice: MissionChoice | null;
  onNextMission: () => void;
}

export const PrivacyMission: React.FC<PrivacyMissionProps> = ({
  mission,
  onAnswer,
  isAnswered,
  selectedChoice,
  onNextMission,
}) => {
  const details = mission.scenarioDetails;
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    (details?.permissionsRequested || []).forEach((p: any) => {
      init[p.name] = p.needed ?? false;
    });
    return init;
  });

  useEffect(() => {
    const init: Record<string, boolean> = {};
    (details?.permissionsRequested || []).forEach((p: any) => {
      init[p.name] = p.needed ?? false;
    });
    setToggles(init);
  }, [mission.id, details]);

  const getPermissionIcon = (name: string) => {
    if (name.includes('รูปภาพ') || name.includes('Photo')) return <ImageIcon className="w-4 h-4 text-apple-teal" />;
    if (name.includes('ไมโครโฟน') || name.includes('Microphone')) return <Mic className="w-4 h-4 text-apple-red" />;
    if (name.includes('กล้อง') || name.includes('Camera')) return <Camera className="w-4 h-4 text-apple-red" />;
    if (name.includes('รายชื่อ') || name.includes('Contact')) return <Users className="w-4 h-4 text-apple-amber" />;
    return <MapPin className="w-4 h-4 text-apple-amber" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* macOS Privacy & Security Dialog */}
      <MacWindow
        title="การตั้งค่าระบบ macOS — ความเป็นส่วนตัวและความปลอดภัย"
        subtitle="App Permission Auditor"
        icon={<Eye className="w-4 h-4 text-apple-purple" />}
        isThreatElevated={isAnswered && selectedChoice ? !selectedChoice.isCorrect : false}
        statusBadge={
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-apple-amber/20 text-apple-amber border border-apple-amber/30 flex items-center gap-1 font-bold">
            <ShieldAlert className="w-3 h-3" /> ตรวจสอบสิทธิ์ (PRIVACY AUDIT)
          </span>
        }
      >
        <div className="bg-[#0b0e14] rounded-xl p-4 sm:p-6 border border-white/5 space-y-4 font-sans">
          {/* App Header */}
          <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
              {details.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  "{details.appName}"
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-apple-red/20 text-apple-red border border-apple-red/30">
                  {details.developer}
                </span>
              </div>
              <p className="text-xs text-apple-gray-400 mt-0.5">
                แอปพลิเคชันที่เพิ่งติดตั้งนี้ กำลังร้องขอสิทธิ์การเข้าถึงข้อมูลและอุปกรณ์ของระบบ:
              </p>
            </div>
          </div>

          {/* Requested Permissions List */}
          <div className="space-y-2.5 font-mono">
            {details.permissionsRequested.map((perm: any) => {
              const isChecked = toggles[perm.name] ?? false;
              return (
                <div
                  key={perm.name}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    perm.suspicious
                      ? 'bg-apple-red/5 border-apple-red/20 hover:border-apple-red/40'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      {getPermissionIcon(perm.name)}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 font-sans">
                        <span>{perm.name}</span>
                        {perm.suspicious && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-apple-red/20 text-apple-red uppercase font-black font-mono">
                            สิทธิ์เกินจำเป็น
                          </span>
                        )}
                        {perm.needed && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-apple-green/20 text-apple-green uppercase font-black font-mono">
                            จำเป็นต่อแอป
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-apple-gray-400 font-sans">
                        เหตุผลการขอ: {perm.reason}
                      </div>
                    </div>
                  </div>

                  {/* macOS Style Toggle Switch */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setToggles({ ...toggles, [perm.name]: !isChecked });
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                      isChecked ? 'bg-apple-blue justify-end' : 'bg-apple-gray-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </MacWindow>

      {/* Decision Question & Choices */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-purple animate-pulse shrink-0"></span>
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
              <span>{selectedChoice.isCorrect ? '✓ บังคับใช้หลักจำกัดสิทธิ์ (Least Privilege) สำเร็จ' : '⚠ เผลอให้สิทธิ์เข้าถึงเครื่องเกินจำเป็น'}</span>
              <span className="font-mono text-xs">
                {selectedChoice.scoreBonus > 0 ? `+${selectedChoice.scoreBonus.toLocaleString()} SCORE` : `${selectedChoice.scoreBonus.toLocaleString()} SCORE`}
              </span>
            </div>
            <p className="text-xs text-apple-gray-200 mt-1 leading-relaxed font-sans">
              {selectedChoice.explanation}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-apple-gray-400 font-sans">
              💡 <strong>หลักการ Least Privilege:</strong> {mission.learningDebrief}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
