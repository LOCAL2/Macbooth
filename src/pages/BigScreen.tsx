import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Trophy, Terminal, Radio, Server, Skull } from 'lucide-react';
import { PlayerSession, LeaderboardEntry } from '../types/game.js';
import { socketService } from '../services/socketService.js';
import { soundEngine } from '../services/soundEngine.js';
import { AppleLogo } from '../components/ui/AppleLogo.js';
import {
  fetchSupabaseLeaderboard,
  subscribeToSupabaseLeaderboard,
} from '../services/supabase.js';

interface LogEvent {
  type: string;
  text: string;
  timestamp: number;
}

export const BigScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [players, setPlayers] = useState<PlayerSession[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [eventLogs, setEventLogs] = useState<LogEvent[]>([
    { type: 'SYSTEM', text: '📡 เชื่อมต่อระบบเครือข่ายป้องกันภัยคุกคาม SOC ประจำบูธสำเร็จ', timestamp: Date.now() },
    { type: 'MONITOR', text: '🛡️ พร้อมรองรับสถานีผู้เล่น MacBook หลายเครื่องพร้อมกัน', timestamp: Date.now() - 5000 },
  ]);

  useEffect(() => {
    const s = socketService.getSocket();

    const handlePlayersUpdate = (activeList: PlayerSession[]) => {
      setPlayers(activeList);
    };

    const handleLeaderboardUpdate = (topList: LeaderboardEntry[]) => {
      setLeaderboard(topList);
    };

    const handleEventLog = (log: LogEvent) => {
      setEventLogs(prev => [log, ...prev.slice(0, 15)]);
      if (log.type === 'CRITICAL_THREAT') {
        soundEngine.playBossPulse();
      }
    };

    s?.on('soc:active_players', handlePlayersUpdate);
    s?.on('soc:leaderboard_updated', handleLeaderboardUpdate);
    s?.on('soc:event_log', handleEventLog);

    // Initial fetch of leaderboard from Supabase / local
    const loadLeaderboard = () => {
      fetchSupabaseLeaderboard(10).then(({ entries }) => {
        if (entries.length > 0) setLeaderboard(entries);
      }).catch(() => {});
    };

    loadLeaderboard();
    const unsubscribeSupabase = subscribeToSupabaseLeaderboard(loadLeaderboard);

    return () => {
      unsubscribeSupabase();
      s?.off('soc:active_players', handlePlayersUpdate);
      s?.off('soc:leaderboard_updated', handleLeaderboardUpdate);
      s?.off('soc:event_log', handleEventLog);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#04060a] text-white p-4 sm:p-6 lg:p-8 font-mono flex flex-col justify-between select-none">
      {/* Top SOC Bar */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-glow-blue backdrop-blur-md">
            <AppleLogo className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-apple-red text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                <Radio className="w-3 h-3 animate-spin" /> LIVE BROADCAST
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                MAC DEFENDER — จอถ่ายทอดสด SOC กลางบูธ
              </h1>
            </div>
            <p className="text-xs text-apple-teal">
              มุมมองสำหรับผู้ชมและโปรเจกเตอร์ 16:9 • MULTI-STATION SPECTATOR VIEW
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 font-mono">
            <Server className="w-4 h-4 text-apple-green" />
            <span>สถานี MACBOOK ออนไลน์: <strong className="text-apple-green text-sm font-bold">{players.length}</strong> เครื่อง</span>
          </div>

          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-apple-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
          >
            ออกจากโหมดจอใหญ่
          </button>
        </div>
      </header>

      {/* Main SOC Dashboard Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6 flex-1">
        {/* Left 2 Cols: Active Player Stations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between font-sans">
            <h2 className="text-xs font-black uppercase text-apple-gray-300 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-apple-blue" />
              สถานะผู้เล่นที่กำลังเชื่อมต่อแบบสด:
            </h2>
            <span className="text-[10px] text-apple-teal">
              อัปเดตอัตโนมัติแบบเรียลไทม์
            </span>
          </div>

          {players.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
              {players.map((p) => {
                const isCritical = p.threatLevel >= 75;
                const isWarning = p.threatLevel >= 40 && p.threatLevel < 75;

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
                      isCritical
                        ? 'glass-alert border-apple-red/50 shadow-glow-red animate-pulse'
                        : isWarning
                        ? 'glass-panel-elevated border-apple-amber/40 shadow-glow-amber'
                        : 'glass-panel border-white/10'
                    }`}
                  >
                    {/* Status Ribbon */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <AppleLogo className="w-5 h-5 text-white" />
                        <div>
                          <h3 className="text-base font-black text-white tracking-wider">
                            {p.nickname}
                          </h3>
                          <span className="text-[10px] text-apple-gray-400 uppercase font-sans">
                            โหมด: [{p.difficulty}]
                          </span>
                        </div>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 font-sans ${
                          isCritical
                            ? 'bg-apple-red text-white animate-bounce'
                            : isWarning
                            ? 'bg-apple-amber/20 text-apple-amber border border-apple-amber/40'
                            : 'bg-apple-green/20 text-apple-green border border-apple-green/40'
                        }`}
                      >
                        {isCritical ? (
                          <>
                            <Skull className="w-3 h-3" /> 🔥 กำลังถูกโจมตี!
                          </>
                        ) : isWarning ? (
                          <>
                            <AlertTriangle className="w-3 h-3" /> เฝ้าระวัง
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3" /> ปลอดภัย
                          </>
                        )}
                      </div>
                    </div>

                    {/* Threat Level Gauge */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="text-[10px] text-apple-gray-400 uppercase font-bold">ระดับภัยคุกคาม</span>
                        <span className={`font-black font-mono ${isCritical ? 'text-apple-red glow-text-red' : 'text-apple-teal'}`}>
                          {p.threatLevel}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCritical ? 'bg-apple-red shadow-glow-red' : isWarning ? 'bg-apple-amber' : 'bg-apple-green'
                          }`}
                          style={{ width: `${p.threatLevel}%` }}
                        />
                      </div>
                    </div>

                    {/* Mission & Score Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-sans">
                      <div className="bg-[#080b11] p-2.5 rounded-xl border border-white/5">
                        <span className="text-[9px] text-apple-gray-500 uppercase">ด่านปัจจุบัน</span>
                        <div className="font-bold text-white text-[11px] truncate">
                          {p.missionTitle || `ด่านที่ ${p.currentMission}`}
                        </div>
                      </div>

                      <div className="bg-[#080b11] p-2.5 rounded-xl border border-white/5">
                        <span className="text-[9px] text-apple-gray-500 uppercase">คะแนนสะสม</span>
                        <div className="font-black text-apple-teal text-[11px] font-mono">
                          {p.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-apple-gray-400 border border-white/10 space-y-3 font-sans">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
                <AppleLogo className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-bold text-white">ทุกสถานีพร้อมรับผู้เล่นใหม่</div>
              <p className="text-xs text-apple-gray-400 max-w-sm mx-auto">
                เปิดหน้าเว็บเกมบนเครื่อง MacBook ประจำบูธเพื่อเชื่อมต่อเข้าสู่จอถ่ายทอดสดกลาง
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Live Event Feed & Top Standings */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Live Incident Attack Feed */}
          <div className="glass-panel-elevated rounded-2xl p-4 border border-white/10 space-y-3 flex-1 font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-black uppercase text-apple-gray-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-apple-teal" /> บันทึกเหตุการณ์สด (LIVE LOGS)
              </span>
              <span className="text-[10px] text-apple-green flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-apple-green animate-ping" /> เรียลไทม์
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-[11px]">
              {eventLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-black/40 border border-white/5 text-apple-gray-300 leading-relaxed font-sans"
                >
                  <span className="text-apple-teal mr-1.5 font-mono">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Top 5 High Scores */}
          <div className="glass-panel-elevated rounded-2xl p-4 border border-white/10 space-y-3 font-sans">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
              <Trophy className="w-4 h-4 text-apple-amber" />
              <h3 className="text-xs font-black uppercase text-apple-amber tracking-wider">
                TOP 5 ผู้พิทักษ์ยอดเยี่ยมประจำวัน
              </h3>
            </div>

            <div className="space-y-1.5 text-xs">
              {leaderboard.slice(0, 5).map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 font-mono"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-apple-gray-400">0{idx + 1}</span>
                    <span className="font-bold text-white">{entry.nickname}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-apple-blue/20 text-apple-teal border border-apple-blue/30 font-sans">
                      RANK {entry.rank}
                    </span>
                  </div>
                  <span className="font-black text-apple-teal">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Marquee Feed */}
      <footer className="glass-panel rounded-xl p-2.5 border border-white/10 flex items-center justify-between text-xs text-apple-gray-300 font-sans">
        <div className="flex items-center space-x-3 overflow-hidden whitespace-nowrap">
          <span className="text-apple-teal font-bold uppercase flex items-center gap-1">
            <AppleLogo className="w-3.5 h-3.5 text-white" /> ข้อความความปลอดภัย:
          </span>
          <span className="text-white animate-pulse">
            ตรวจสอบโดเมนอีเมลเสมอ • ใช้วลีรหัสผ่านที่มีความยาว • อย่าให้รหัส OTP แก่ใครทางโทรศัพท์เด็ดขาด!
          </span>
        </div>
        <span className="hidden sm:inline text-apple-gray-500 text-[10px] font-mono">
          HOST IP: {window.location.hostname}
        </span>
      </footer>
    </div>
  );
};
