import React, { useState } from 'react';
import { Settings, Lock, Unlock, Radio, RotateCcw, Download, Trash2, ArrowLeft, ShieldAlert, Zap, Skull, Award, Volume2, Activity } from 'lucide-react';
import { soundEngine } from '../services/soundEngine.js';
import { socketService } from '../services/socketService.js';
import { BoothStats, LeaderboardEntry } from '../types/game.js';
import { AppleLogo } from '../components/ui/AppleLogo.js';
import { clearSupabaseLeaderboard, deleteSingleSupabaseEntry, fetchSupabaseLeaderboard } from '../services/supabase.js';

export const Admin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [stats, setStats] = useState<BoothStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [easyTime, setEasyTime] = useState(420);
  const [normalTime, setNormalTime] = useState(300);
  const [nightmareTime, setNightmareTime] = useState(180);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check against Vite environment variable or server API endpoint
    const envPin = import.meta.env.VITE_ADMIN_PIN;
    if (envPin && pin === envPin) {
      soundEngine.playSuccess();
      setIsAuthenticated(true);
      setAuthError('');
      fetchAdminData();
      return;
    }

    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        soundEngine.playSuccess();
        setIsAuthenticated(true);
        setAuthError('');
        fetchAdminData();
      } else {
        soundEngine.playError();
        setAuthError(data.error || 'รหัส PIN ไม่ถูกต้อง');
      }
    } catch (err) {
      soundEngine.playError();
      setAuthError('รหัส PIN ไม่ถูกต้อง');
    }
  };

  const fetchAdminData = () => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStats(d.stats);
        }
      })
      .catch(() => {});

    fetchSupabaseLeaderboard(50)
      .then(({ entries }) => {
        setLeaderboard(entries);
      })
      .catch(() => {});

    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.settings) {
          setEasyTime(d.settings.timeEasy);
          setNormalTime(d.settings.timeNormal);
          setNightmareTime(d.settings.timeNightmare);
        }
      })
      .catch(() => {});
  };

  // MC Remote Action Dispatcher
  const triggerMCEvent = (type: string, message?: string) => {
    soundEngine.playTerminalBeep();
    socketService.triggerMCAction({ type, message }, pin);
    setSaveSuccessMsg(`ส่งคำสั่งรีโมตไปยังทุกเครื่องสำเร็จ: ${type}`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleResetLeaderboard = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างคะแนนทั้งหมดในตารางเพื่อเริ่มวันใหม่?')) return;

    // Clear Supabase if connected
    const supabaseCleared = await clearSupabaseLeaderboard();

    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    if (isVercel) {
      soundEngine.playSuccess();
      setLeaderboard([]);
      fetchAdminData();
      setSaveSuccessMsg('รีเซ็ตตารางคะแนนบน Supabase เรียบร้อยแล้ว!');
      return;
    }

    // Clear Local DB if on local server
    fetch('/api/admin/reset-leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': pin,
      },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          soundEngine.playSuccess();
          setLeaderboard([]);
          fetchAdminData();
          setSaveSuccessMsg('รีเซ็ตตารางคะแนนเรียบร้อยแล้ว!');
        }
      })
      .catch(() => alert('ไม่สามารถรีเซ็ตตารางคะแนนได้'));
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteSingleSupabaseEntry(id);
    fetch(`/api/leaderboard/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': pin },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          soundEngine.playClick();
          setLeaderboard(prev => prev.filter(e => e.id !== id));
        }
      })
      .catch(() => {});
  };

  const handleSaveSettings = () => {
    fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': pin,
      },
      body: JSON.stringify({
        timeEasy: easyTime,
        timeNormal: normalTime,
        timeNightmare: nightmareTime,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          soundEngine.playSuccess();
          setSaveSuccessMsg('บันทึกการตั้งเวลาไปยังทุกเครื่องเรียบร้อยแล้ว!');
          setTimeout(() => setSaveSuccessMsg(''), 3000);
        }
      })
      .catch(() => {});
  };

  const exportCSV = () => {
    soundEngine.playClick();
    const headers = 'ID,Nickname,Score,Rank,Time,ThreatsBlocked,Difficulty,CompletedAt\n';
    const rows = leaderboard
      .map(
        e =>
          `"${e.id}","${e.nickname}",${e.score},"${e.rank}","${e.timeFormatted}",${e.threatsBlocked},"${e.difficulty}","${e.completedAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mac_defender_scores_${Date.now()}.csv`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto shadow-glow-blue">
            <AppleLogo className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-wide">
              ระบบควบคุมสำหรับเจ้าหน้าที่ (STAFF ADMIN)
            </h1>
            <p className="text-xs text-apple-gray-400 mt-1">
              กรอกรหัส PIN เจ้าหน้าที่เพื่อเปิดรีโมตควบคุมเวทีและดูสถิติบูธ
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-mono">
            <input
              type="password"
              maxLength={6}
              placeholder="กรอก PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-white/15 text-center text-white text-lg font-black tracking-widest focus:outline-none focus:border-apple-blue"
            />

            {authError && (
              <div className="text-xs text-apple-red font-bold animate-shake font-sans">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-black text-sm shadow-glow-blue transition cursor-pointer font-sans"
            >
              เข้าสู่ระบบเจ้าหน้าที่
            </button>
          </form>

          <button
            onClick={onBack}
            className="text-xs text-apple-gray-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition cursor-pointer font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> กลับสู่หน้าแรก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-8 font-mono space-y-8 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 font-sans">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onBack();
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-apple-gray-300 border border-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <AppleLogo className="w-5 h-5 text-white" />
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  ศูนย์ควบคุมและรีโมตเวทีสำหรับพิธีกร (MC & STAFF)
                </h1>
              </div>
              <p className="text-xs text-apple-gray-400">
                ควบคุมเหตุการณ์สดบนเวที • สถิติบูธ • จัดการสถานี MacBook
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-apple-green/20 text-apple-green border border-apple-green/30 font-bold flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5" /> ยืนยันสิทธิ์เจ้าหน้าที่แล้ว
            </span>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-3 rounded-xl bg-apple-green/20 border border-apple-green/40 text-apple-green text-xs font-bold text-center animate-fadeIn font-sans">
            ✓ {saveSuccessMsg}
          </div>
        )}

        {/* 1. Stage MC Remote Demo Controls */}
        <div className="glass-panel-elevated rounded-2xl p-6 border border-white/10 space-y-4 shadow-2xl font-sans">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-apple-teal">
              <Radio className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                🎤 รีโมตสั่งการสดบนเวทีสำหรับพิธีกร MC (STAGE DEMO TRIGGERS)
              </h2>
            </div>
            <span className="text-[10px] text-apple-amber font-bold">
              กดแล้วส่งผลต่อทุกเครื่องทันที
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono">
            <button
              onClick={() => triggerMCEvent('TRIGGER_ATTACK', 'จำลองการโจมตีแบบเร่งด่วน')}
              className="p-3 rounded-xl bg-apple-red/20 hover:bg-apple-red/30 text-apple-red border border-apple-red/40 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer font-sans"
            >
              <Zap className="w-5 h-5" />
              <span>สั่งโจมตี (THREAT ↑)</span>
            </button>

            <button
              onClick={() => triggerMCEvent('TRIGGER_PHISHING', 'ส่ง Phishing หลอกลวง')}
              className="p-3 rounded-xl bg-apple-amber/20 hover:bg-apple-amber/30 text-apple-amber border border-apple-amber/40 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer font-sans"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>ยิง PHISHING</span>
            </button>

            <button
              onClick={() => triggerMCEvent('TRIGGER_CRITICAL', 'เปิดสัญญาณเตือนภัย')}
              className="p-3 rounded-xl bg-apple-red/20 hover:bg-apple-red/30 text-apple-red border border-apple-red/40 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer animate-pulse font-sans"
            >
              <Volume2 className="w-5 h-5" />
              <span>เปิดไซเรนเตือนภัย</span>
            </button>

            <button
              onClick={() => triggerMCEvent('TRIGGER_GLITCH')}
              className="p-3 rounded-xl bg-apple-purple/20 hover:bg-apple-purple/30 text-apple-purple border border-apple-purple/40 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer font-sans"
            >
              <Activity className="w-5 h-5" />
              <span>สั่งจอ GLITCH</span>
            </button>

            <button
              onClick={() => triggerMCEvent('FORCE_COMPLETE', 'สาธิตการชนะภารกิจ')}
              className="p-3 rounded-xl bg-apple-green/20 hover:bg-apple-green/30 text-apple-green border border-apple-green/40 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer font-sans"
            >
              <Award className="w-5 h-5" />
              <span>สั่งชนะภารกิจ</span>
            </button>

            <button
              onClick={() => triggerMCEvent('FORCE_GAME_OVER', 'สาธิตระบบถูกเจาะ')}
              className="p-3 rounded-xl bg-apple-red/20 hover:bg-apple-red/30 text-apple-red border border-apple-red/40 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer font-sans"
            >
              <Skull className="w-5 h-5" />
              <span>สั่งแพ้/โดนเจาะ</span>
            </button>
          </div>
        </div>

        {/* 2. Booth Metrics Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-apple-gray-400 uppercase tracking-widest font-bold">
                ผู้เล่นทั้งหมดวันนี้
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">
                {stats.playersToday} คน
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-apple-gray-400 uppercase tracking-widest font-bold">
                เล่นจบภารกิจสำเร็จ
              </span>
              <div className="text-2xl sm:text-3xl font-black text-apple-green mt-1 font-mono">
                {stats.completed} ครั้ง
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-apple-gray-400 uppercase tracking-widest font-bold">
                คะแนนเฉลี่ย
              </span>
              <div className="text-2xl sm:text-3xl font-black text-apple-teal mt-1 font-mono">
                {stats.averageScore.toLocaleString()}
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-apple-gray-400 uppercase tracking-widest font-bold">
                เวลาเฉลี่ยที่ใช้
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">
                {stats.averageTime} นาที
              </div>
            </div>
          </div>
        )}

        {/* 3. Terminal Mission Time Settings */}
        <div className="glass-panel-elevated rounded-2xl p-6 border border-white/10 space-y-4 font-sans">
          <h2 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-apple-blue" />
            ปรับแต่งเวลาการเล่นแต่ละระดับความยาก (หน่วย: วินาที)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="space-y-1.5 font-sans">
              <label className="text-apple-gray-400 font-bold">ระดับง่าย (EASY SECONDS):</label>
              <input
                type="number"
                value={easyTime}
                onChange={e => setEasyTime(parseInt(e.target.value) || 300)}
                className="w-full p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-black font-mono"
              />
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-apple-gray-400 font-bold">ระดับปกติ (NORMAL SECONDS):</label>
              <input
                type="number"
                value={normalTime}
                onChange={e => setNormalTime(parseInt(e.target.value) || 300)}
                className="w-full p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-black font-mono"
              />
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-apple-gray-400 font-bold">ระดับฝันร้าย (NIGHTMARE SECONDS):</label>
              <input
                type="number"
                value={nightmareTime}
                onChange={e => setNightmareTime(parseInt(e.target.value) || 180)}
                className="w-full p-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-black font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-black text-xs shadow-glow-blue transition cursor-pointer font-sans"
            >
              บันทึกการตั้งเวลาไปยังทุกเครื่อง
            </button>
          </div>
        </div>

        {/* 4. Leaderboard Management & CSV Export */}
        <div className="glass-panel-elevated rounded-2xl p-6 border border-white/10 space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-wide">
                จัดการฐานข้อมูลคะแนน (LEADERBOARD MANAGEMENT)
              </h2>
              <p className="text-xs text-apple-gray-400">
                มี {leaderboard.length} รายการคะแนนที่บันทึกไว้ในฐานข้อมูล SQLite
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={exportCSV}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-apple-teal border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> ส่งออกเป็นไฟล์ CSV
              </button>

              <button
                onClick={handleResetLeaderboard}
                className="px-3 py-2 rounded-xl bg-apple-red/20 hover:bg-apple-red/30 text-apple-red border border-apple-red/40 flex items-center gap-1.5 transition cursor-pointer font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" /> ล้างคะแนนทั้งหมด
              </button>
            </div>
          </div>

          {/* Records Table Preview */}
          <div className="max-h-64 overflow-y-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="text-apple-gray-400 border-b border-white/10 text-[10px] uppercase font-sans">
                  <th className="py-2">ฉายาผู้เล่น</th>
                  <th className="py-2">คะแนน</th>
                  <th className="py-2">ระดับ</th>
                  <th className="py-2">เวลา</th>
                  <th className="py-2">ความยาก</th>
                  <th className="py-2 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {leaderboard.slice(0, 20).map(entry => (
                  <tr key={entry.id} className="hover:bg-white/5">
                    <td className="py-2 font-bold text-white">{entry.nickname}</td>
                    <td className="py-2 text-apple-teal font-black">{entry.score.toLocaleString()}</td>
                    <td className="py-2 font-bold">RANK {entry.rank}</td>
                    <td className="py-2 text-apple-gray-400">{entry.timeFormatted}</td>
                    <td className="py-2 uppercase text-[10px]">[{entry.difficulty}]</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 rounded bg-apple-red/20 text-apple-red hover:bg-apple-red/40 transition cursor-pointer"
                        title="ลบคะแนนนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-apple-gray-500 py-4 border-t border-white/5 font-sans flex items-center justify-center gap-1.5">
        <AppleLogo className="w-3.5 h-3.5 text-apple-gray-400" /> Mac Defender Admin Sentinel • ระบบบริหารจัดการประจำบูธนิทรรศการ
      </footer>
    </div>
  );
};
