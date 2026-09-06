import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, UserPlus, BookOpen, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { GameState, SecurityRank } from '../types/game.js';
import { soundEngine } from '../services/soundEngine.js';
import { SecurityTipsModal } from '../components/modals/SecurityTipsModal.js';
import { AppleLogo } from '../components/ui/AppleLogo.js';
import { submitScoreToSupabase } from '../services/supabase.js';

interface ResultsProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onNewPlayer: () => void;
  onViewLeaderboard: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  gameState,
  onPlayAgain,
  onNewPlayer,
  onViewLeaderboard,
}) => {
  const [showTips, setShowTips] = useState(false);
  const hasSubmitted = React.useRef(false);

  const rank = gameState.rank || 'B';
  const isVictory = gameState.isVictory;

  const getRankDetails = (r: SecurityRank) => {
    switch (r) {
      case 'S':
        return {
          title: 'ผู้พิทักษ์ไซเบอร์ (CYBER GUARDIAN)',
          desc: 'การป้องกันไร้ที่ติ! คุณรู้ทันทุกกลอุบายจิตวิทยา (Social Engineering) และสกัดกั้นภัยคุกคามหลายทิศทางได้อย่างเฉียบขาด',
          color: 'text-apple-green glow-text-green',
          border: 'border-apple-green/50 bg-apple-green/10',
          badge: 'bg-gradient-to-r from-emerald-500 to-green-600',
        };
      case 'A':
        return {
          title: 'ผู้เชี่ยวชาญความปลอดภัย (SECURITY EXPERT)',
          desc: 'มีความตระหนักรู้ด้านไซเบอร์สูงมาก สามารถรับมือกับภัยคุกคามหลักได้อย่างรวดเร็วและถูกต้อง',
          color: 'text-apple-teal glow-text-blue',
          border: 'border-apple-blue/50 bg-apple-blue/10',
          badge: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        };
      case 'B':
        return {
          title: 'ตระหนักรู้ความปลอดภัย (SECURITY AWARE)',
          desc: 'มีพื้นฐานความเข้าใจที่ดี แต่อาจมีบางกลลวงที่เผลอหลงกล หมั่นสังเกตและฝึกฝนความปลอดภัยเป็นประจำ!',
          color: 'text-apple-amber glow-text-amber',
          border: 'border-apple-amber/50 bg-apple-amber/10',
          badge: 'bg-gradient-to-r from-amber-500 to-orange-600',
        };
      case 'C':
        return {
          title: 'เป้าหมายที่โจมตีง่าย (EASY TARGET)',
          desc: 'แฮกเกอร์สามารถเจาะระบบได้หลายจุด ศึกษาเคล็ดลับความปลอดภัยเพื่อเพิ่มเกราะป้องกันให้ Mac ของคุณ',
          color: 'text-orange-500',
          border: 'border-orange-500/40 bg-orange-500/10',
          badge: 'bg-orange-600',
        };
      case 'D':
      default:
        return {
          title: "เหยื่อคนโปรดของแฮกเกอร์ (HACKER'S FAVORITE)",
          desc: 'ระบบถูกเจาะล้มเหลว! ข้อควรระวัง: ห้ามคลิกลิงก์แปลกปลอม ห้ามบอกรหัส OTP และอย่าหลงเชื่อหน้าเว็บไวรัสปลอม',
          color: 'text-apple-red glow-text-red',
          border: 'border-apple-red/50 bg-apple-red/10',
          badge: 'bg-apple-red',
        };
    }
  };

  const rankInfo = getRankDetails(rank);

  // Trigger Victory Confetti & Save Score
  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    
    if (isVictory) {
      soundEngine.playVictory();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', '#ffffff'],
        });
      } catch (e) {}
    } else {
      soundEngine.playBreach();
    }

    // Save to backend database or Supabase (prevent duplicate submission)
    const getMaxTime = (diff: string) => {
      if (diff === 'easy') return 420;
      if (diff === 'nightmare') return 180;
      return 300;
    };

    const sumTimeSpent = (gameState.results || []).reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);
    const maxTime = getMaxTime(gameState.difficulty);
    const timeSpent = sumTimeSpent > 0 ? sumTimeSpent : Math.max(1, maxTime - gameState.timeRemaining);

    const mins = Math.floor(timeSpent / 60);
    const secs = timeSpent % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const scorePayload = {
      callsign: gameState.nickname,
      nickname: gameState.nickname,
      score: gameState.score,
      rank: gameState.rank || 'B',
      timeFormatted,
      timeSeconds: timeSpent,
      threatsBlocked: gameState.threatsBlocked,
      difficulty: gameState.difficulty,
    };

    // 1. Submit to Supabase Realtime Database if configured
    submitScoreToSupabase(scorePayload).then(submittedToSupabase => {
      // 2. Fallback to local backend API ONLY if Supabase is not configured/failed
      if (!submittedToSupabase) {
        fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scorePayload),
        }).catch(err => console.warn('Could not post score to server:', err));
      }
    });
  }, []);

  const formatTotalTime = () => {
    const getMaxTime = (diff: string) => {
      if (diff === 'easy') return 420;
      if (diff === 'nightmare') return 180;
      return 300;
    };

    const sumTimeSpent = (gameState.results || []).reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);
    const maxTime = getMaxTime(gameState.difficulty);
    const timeSpent = sumTimeSpent > 0 ? sumTimeSpent : Math.max(1, maxTime - gameState.timeRemaining);

    const mins = Math.floor(timeSpent / 60);
    const secs = timeSpent % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} นาที`;
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-8 flex flex-col justify-between font-mono animate-fadeIn">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-apple-gray-300 font-sans">
          <AppleLogo className="w-3.5 h-3.5 text-white" />
          <span>สรุปผลภารกิจ MAC DEFENDER SIMULATION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wider font-sans">
          {isVictory ? 'ภารกิจเสร็จสิ้น (MISSION COMPLETE)' : 'ระบบถูกโจมตีล้มเหลว (SYSTEM OVERRUN)'}
        </h1>
        <p className="text-xs sm:text-sm text-apple-gray-400 font-sans">
          ผู้พิทักษ์: <strong className="text-white text-base font-mono">{gameState.nickname}</strong> • โหมด: [{gameState.difficulty.toUpperCase()}]
        </p>
      </div>

      {/* Main Results Card */}
      <div className="my-6 glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
        {/* Score & Rank Hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/10 pb-6 text-center">
          {/* Final Score */}
          <div className="bg-[#07090e] p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
            <span className="text-[10px] uppercase text-apple-gray-400 tracking-widest font-bold font-sans">
              คะแนนรวม (FINAL SCORE)
            </span>
            <span className="text-3xl sm:text-4xl font-black text-apple-teal glow-text-blue mt-1 font-mono">
              {gameState.score.toLocaleString()}
            </span>
          </div>

          {/* Rank Badge */}
          <div className={`p-4 rounded-2xl border ${rankInfo.border} flex flex-col items-center justify-center`}>
            <span className="text-[10px] uppercase tracking-widest font-bold text-apple-gray-300 font-sans">
              ระดับความปลอดภัย (SECURITY RANK)
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-4xl sm:text-5xl font-black ${rankInfo.color} font-mono`}>
                {rank}
              </span>
              <div className="text-left">
                <div className="text-xs font-black text-white tracking-tight font-sans">
                  {rankInfo.title}
                </div>
                <div className="text-[9px] text-apple-gray-400 font-sans">
                  ระดับการประเมินทักษะ
                </div>
              </div>
            </div>
          </div>

          {/* Time & Threats Blocked */}
          <div className="bg-[#07090e] p-4 rounded-2xl border border-white/5 flex flex-col justify-center text-center">
            <div className="text-[10px] uppercase text-apple-gray-400 tracking-widest font-bold font-sans">
              เวลาที่ใช้ปกป้อง
            </div>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">
              {formatTotalTime()}
            </div>
            <div className="text-[11px] text-apple-green font-bold mt-1 font-sans">
              🛡️ สกัดกั้นสำเร็จ {gameState.threatsBlocked} ด่าน
            </div>
          </div>
        </div>

        {/* Threat Vector Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-apple-gray-400 tracking-wider font-sans">
            รายงานการตรวจสอบการป้องกันรายด่าน (DEFENSE AUDIT):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {gameState.results.length > 0 ? (
              gameState.results.map((res, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    res.passed
                      ? 'bg-apple-green/5 border-apple-green/20 text-apple-green'
                      : 'bg-apple-red/5 border-apple-red/20 text-apple-red'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-apple-green flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-apple-red flex-shrink-0" />
                    )}
                    <span className="text-white font-bold font-sans">{res.title}</span>
                  </div>
                  <span className="text-[11px] font-mono">
                    {res.scoreDelta > 0 ? `+${res.scoreDelta}` : `${res.scoreDelta}`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-apple-gray-400 p-3 bg-white/5 rounded-xl col-span-2 font-sans">
                ภารกิจยุติก่อนกำหนดเนื่องจากระดับภัยคุกคาม (Threat Level) ทะลุ 100%
              </div>
            )}
          </div>
        </div>

        {/* Rank Analysis Text */}
        <div className="p-4 rounded-xl bg-[#07090e] border border-white/5 text-xs text-apple-gray-200 font-sans leading-relaxed">
          <strong>สรุปบทวิเคราะห์:</strong> {rankInfo.desc}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 z-10 font-sans">
        <button
          onClick={() => {
            soundEngine.playClick();
            onPlayAgain();
          }}
          className="p-3.5 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-blue transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> [ เล่นอีกครั้ง ]
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setShowTips(true);
          }}
          className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-apple-teal border border-white/10 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <BookOpen className="w-4 h-4" /> [ อ่านเคล็ดลับความปลอดภัย ]
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onViewLeaderboard();
          }}
          className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-apple-amber border border-white/10 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Trophy className="w-4 h-4" /> [ ตารางอันดับ ]
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onNewPlayer();
          }}
          className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> [ เปลี่ยนผู้เล่นใหม่ ]
        </button>
      </div>

      {/* Security Tips Modal */}
      <SecurityTipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
};
