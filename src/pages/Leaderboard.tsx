import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, Search, RefreshCw, Play, Radio, Database } from 'lucide-react';
import { LeaderboardEntry } from '../types/game.js';
import { soundEngine } from '../services/soundEngine.js';
import { socketService } from '../services/socketService.js';
import {
  fetchSupabaseLeaderboard,
  subscribeToSupabaseLeaderboard,
  isSupabaseConfigured,
} from '../services/supabase.js';

interface LeaderboardProps {
  onBack: () => void;
  onPlayNow: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, onPlayNow }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { entries: data, isRealSupabase } = await fetchSupabaseLeaderboard(50);
      setEntries(data);
      setIsSupabaseLive(isRealSupabase);
    } catch (err) {
      console.warn('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // ⚡ Listen to Supabase Realtime updates
    const unsubscribeSupabase = subscribeToSupabaseLeaderboard(() => {
      fetchLeaderboard();
    });

    return () => {
      unsubscribeSupabase();
    };
  }, []);

  const filtered = entries.filter((item) => {
    const matchesDiff = filterDifficulty === 'all' || item.difficulty === filterDifficulty;
    const matchesSearch = item.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'S':
        return 'bg-apple-green/20 text-apple-green border-apple-green/40';
      case 'A':
        return 'bg-apple-blue/20 text-apple-teal border-apple-blue/40';
      case 'B':
        return 'bg-apple-amber/20 text-apple-amber border-apple-amber/40';
      default:
        return 'bg-apple-red/20 text-apple-red border-apple-red/40';
    }
  };

  const getDiffLabelThai = (d: string) => {
    if (d === 'all') return 'ทั้งหมด';
    if (d === 'easy') return 'ง่าย';
    if (d === 'normal') return 'ปกติ';
    if (d === 'nightmare') return 'ฝันร้าย';
    return d;
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 py-8 font-mono flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6 font-sans">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onBack();
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-apple-gray-300 border border-white/10 transition cursor-pointer"
              title="กลับสู่หน้าหลัก"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-apple-amber" />
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  ตารางอันดับยอดนักปกป้อง MAC (LEADERBOARD)
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs text-apple-gray-400">
                  Hall of Fame ประจำบูธ • อัปเดตแบบเรียลไทม์สด
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                fetchLeaderboard();
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-apple-teal border border-white/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onPlayNow();
              }}
              className="px-4 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white text-xs font-black tracking-wider shadow-glow-blue transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>[ เล่นเลย ]</span>
            </button>
          </div>
        </div>

        {/* Configuration Notice if not connected to Supabase */}
        {!isSupabaseConfigured() && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300/90 font-sans backdrop-blur">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>สถานะ Supabase:</strong> กำลังใช้ฐานข้อมูลภายในเครื่อง หากต้องการเชื่อมต่อ Supabase จริง ให้ใส่ <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-200 font-mono font-bold">db_url</code> และ <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-200 font-mono font-bold">anon</code> ในไฟล์ <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-200 font-mono font-bold">.env</code>
              </span>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 font-sans">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-apple-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อเรียกขาน / ฉายาผู้เล่น..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs uppercase focus:outline-none focus:border-apple-blue font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            {['all', 'easy', 'normal', 'nightmare'].map((d) => (
              <button
                key={d}
                onClick={() => {
                  soundEngine.playClick();
                  setFilterDifficulty(d);
                }}
                className={`px-3 py-2 rounded-xl text-xs uppercase font-bold border transition cursor-pointer ${
                  filterDifficulty === d
                    ? 'bg-apple-blue/20 border-apple-blue text-apple-teal shadow-glow-blue'
                    : 'bg-white/5 border-white/10 text-apple-gray-400 hover:bg-white/10'
                }`}
              >
                {getDiffLabelThai(d)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass-panel-elevated rounded-2xl border border-white/10 overflow-hidden shadow-2xl font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#111622] text-apple-gray-400 border-b border-white/10 uppercase tracking-wider text-[10px] font-sans font-bold">
                  <th className="py-3 px-4"># อันดับ</th>
                  <th className="py-3 px-4">ฉายา / ชื่อเรียกขาน</th>
                  <th className="py-3 px-4">คะแนน</th>
                  <th className="py-3 px-4">ระดับ (RANK)</th>
                  <th className="py-3 px-4">เวลาที่ใช้</th>
                  <th className="py-3 px-4">ความยาก</th>
                  <th className="py-3 px-4 text-right">สกัดกั้นสำเร็จ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filtered.length > 0 ? (
                  filtered.map((entry, idx) => {
                    const isTop3 = idx < 3;
                    return (
                      <tr
                        key={entry.id || idx}
                        className={`hover:bg-white/5 transition-colors ${
                          isTop3 ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        {/* Position */}
                        <td className="py-3.5 px-4 font-black">
                          {idx === 0 ? (
                            <span className="text-apple-amber flex items-center gap-1 text-sm glow-text-amber font-sans">
                              🥇 01
                            </span>
                          ) : idx === 1 ? (
                            <span className="text-apple-gray-300 flex items-center gap-1 text-sm font-sans">
                              🥈 02
                            </span>
                          ) : idx === 2 ? (
                            <span className="text-amber-600 flex items-center gap-1 text-sm font-sans">
                              🥉 03
                            </span>
                          ) : (
                            <span className="text-apple-gray-500">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          )}
                        </td>

                        {/* Callsign / Nickname */}
                        <td className="py-3.5 px-4 font-bold text-white text-sm tracking-wide">
                          <div className="flex items-center gap-2">
                            <span>{entry.nickname}</span>
                            {isTop3 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-apple-teal border border-white/10 font-mono uppercase">
                                Top Defender
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4 font-black text-apple-teal text-sm glow-text-blue">
                          {entry.score.toLocaleString()}
                        </td>

                        {/* Rank Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black border ${getRankBadgeColor(
                              entry.rank
                            )}`}
                          >
                            RANK {entry.rank}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-4 text-apple-gray-300">
                          {entry.timeFormatted}
                        </td>

                        {/* Difficulty */}
                        <td className="py-3.5 px-4 uppercase text-[10px] text-apple-gray-400 font-sans">
                          [{getDiffLabelThai(entry.difficulty)}]
                        </td>

                        {/* Threats Blocked */}
                        <td className="py-3.5 px-4 text-right font-bold text-apple-green font-sans">
                          🛡️ {entry.threatsBlocked} ด่าน
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-apple-gray-400 font-sans">
                      {loading ? 'กำลังโหลดข้อมูลอันดับ...' : 'ยังไม่มีประวัติคะแนน เป็นคนแรกที่มาพิชิตภารกิจเลย!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

