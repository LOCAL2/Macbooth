import React, { useState } from 'react';
import { Shield, Play, Trophy, Tv, Settings, Sparkles, Volume2, VolumeX, BookOpen } from 'lucide-react';
import { Difficulty } from '../types/game.js';
import { NICKNAME_PRESETS } from '../data/missionsData.js';
import { soundEngine } from '../services/soundEngine.js';
import { SecurityTipsModal } from '../components/modals/SecurityTipsModal.js';
import { AppleLogo } from '../components/ui/AppleLogo.js';
import { DecryptedText } from '../components/effects/DecryptedText.js';

interface HomeProps {
  initialNickname?: string;
  onStartGame: (nickname: string, difficulty: Difficulty) => void;
  onNavigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ initialNickname, onStartGame, onNavigate }) => {
  const [nickname, setNickname] = useState<string>(() => {
    const saved = localStorage.getItem('macdefender_nickname');
    if (saved) return saved;
    if (initialNickname && initialNickname !== 'CYBERFOX') {
      localStorage.setItem('macdefender_nickname', initialNickname);
      return initialNickname;
    }
    const pick = NICKNAME_PRESETS[Math.floor(Math.random() * NICKNAME_PRESETS.length)];
    localStorage.setItem('macdefender_nickname', pick);
    return pick;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [showTips, setShowTips] = useState(false);
  const [soundState, setSoundState] = useState(soundEngine.isEnabled());

  const handleNicknameChange = (newVal: string) => {
    const uppercaseVal = newVal.toUpperCase();
    setNickname(uppercaseVal);
    localStorage.setItem('macdefender_nickname', uppercaseVal);
  };

  const handleRandomizeNick = () => {
    soundEngine.playClick();
    const pick = NICKNAME_PRESETS[Math.floor(Math.random() * NICKNAME_PRESETS.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    const newNick = `${pick}_${num}`;
    setNickname(newNick);
    localStorage.setItem('macdefender_nickname', newNick);
  };

  const getMissionTimeText = () => {
    if (difficulty === 'easy') return '07:00 นาที';
    if (difficulty === 'nightmare') return '03:00 นาที';
    return '05:00 นาที';
  };

  const handleStart = () => {
    soundEngine.playBootSound();
    const finalNick = nickname.trim().toUpperCase() || 'DEFENDER_01';
    localStorage.setItem('macdefender_nickname', finalNick);
    onStartGame(finalNick, difficulty);
  };

  const toggleSound = () => {
    const next = soundEngine.toggle();
    setSoundState(next);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative max-w-7xl mx-auto font-sans">
      {/* Top Navbar */}
      <header className="flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white shadow-glow-blue border border-white/15 backdrop-blur-md">
            <AppleLogo className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white font-mono flex items-center gap-1.5">
              MAC DEFENDER
            </h1>
            <p className="text-[10px] text-apple-teal font-mono tracking-widest uppercase">
              APPLE SOC DEFENSE TERMINAL
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-apple-gray-300 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            title={soundState ? 'เปิดเสียงอยู่' : 'ปิดเสียงอยู่'}
          >
            {soundState ? (
              <Volume2 className="w-4 h-4 text-apple-green" />
            ) : (
              <VolumeX className="w-4 h-4 text-apple-gray-400" />
            )}
            <span className="hidden sm:inline text-[11px] font-sans">
              {soundState ? 'เสียงเปิด' : 'ปิดเสียง'}
            </span>
          </button>

          {/* Leaderboard Link */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onNavigate('leaderboard');
            }}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-apple-gray-200 transition flex items-center gap-1.5 cursor-pointer font-sans backdrop-blur-md"
          >
            <Trophy className="w-4 h-4 text-apple-amber" />
            <span className="hidden sm:inline">ตารางอันดับ</span>
          </button>

          {/* BigScreen Projector */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onNavigate('bigscreen');
            }}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-apple-teal transition flex items-center gap-1.5 cursor-pointer font-sans backdrop-blur-md"
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">จอถ่ายทอดสด</span>
          </button>

          {/* Admin */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onNavigate('admin');
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-apple-gray-400 hover:text-white transition cursor-pointer backdrop-blur-md"
            title="สำหรับเจ้าหน้าที่บูธและพิธีกร MC"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center my-8 z-10 space-y-8 max-w-3xl mx-auto">
        {/* Apple Glitch Badge */}
        <div className="space-y-4 flex flex-col items-center">
          {/* Big Glowing Apple Logo Emblem */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-apple-blue via-apple-teal to-purple-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500 animate-pulse"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0e121a]/90 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-xl">
              <AppleLogo className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-apple-blue/10 border border-apple-blue/30 text-apple-teal text-xs font-bold font-sans tracking-wide shadow-glow-blue backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-apple-teal" />
            <span>เกมจำลองสถานการณ์ความปลอดภัยไซเบอร์ประจำบูธ</span>
          </div>

          <div className="space-y-2 flex flex-col items-center justify-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight font-sans flex items-center justify-center gap-3 leading-tight select-none">
              <AppleLogo className="w-10 h-10 sm:w-14 sm:h-14 inline-block text-white flex-shrink-0" />
              <DecryptedText
                text="MAC DEFENDER"
                speed={40}
                maxIterations={12}
                animateOn="view"
                loop={true}
                loopInterval={5000}
                className="text-white"
                encryptedClassName="text-apple-teal opacity-80"
              />
            </h1>
            <h2 className="text-xl sm:text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-apple-red via-apple-amber to-apple-teal glow-text-red leading-normal select-none">
              <DecryptedText
                text="SURVIVE THE HACK"
                speed={40}
                maxIterations={15}
                animateOn="view"
                loop={true}
                loopInterval={2500}
                revealDirection="center"
                characters="01#%&*@!$<>[]{}_~"
                className="text-transparent bg-clip-text bg-gradient-to-r from-apple-red via-apple-amber to-apple-teal"
                encryptedClassName="text-apple-red opacity-80"
              />
            </h2>
          </div>

          <p className="text-base sm:text-xl text-apple-gray-200 font-sans italic max-w-xl mx-auto">
            "Mac ของคุณกำลังถูกโจมตี คุณจะเอาชีวิตรอดได้หรือไม่?"
          </p>
        </div>

        {/* Mission Setup Box */}
        <div className="w-full glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl backdrop-blur-2xl">
          {/* Nickname Input & Generator */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-apple-gray-300 font-sans flex items-center justify-between">
              <span>ฉายา / รหัสเรียกขานผู้เล่น:</span>
              <span className="text-[10px] text-apple-green font-normal">ปลอดภัย 100% ไม่ขอข้อมูลส่วนตัวจริง</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={15}
                value={nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                placeholder="ระบุฉายาผู้เล่น"
                className="flex-1 px-4 py-3.5 rounded-xl bg-[#07090e] border border-white/15 text-white font-mono text-sm sm:text-base font-bold tracking-wider focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/30 uppercase"
              />
              <button
                type="button"
                onClick={handleRandomizeNick}
                className="px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-apple-teal border border-white/10 text-xs font-sans font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="สุ่มชื่อเท่ๆ"
              >
                <Sparkles className="w-4 h-4" />
                <span>สุ่มชื่อ</span>
              </button>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-apple-gray-300 font-sans">
              เลือกระดับความท้าทาย (DIFFICULTY):
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 font-sans">
              {/* EASY */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setDifficulty('easy');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  difficulty === 'easy'
                    ? 'bg-apple-green/15 border-apple-green text-apple-green shadow-glow-green font-bold'
                    : 'bg-white/5 border-white/10 text-apple-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-black">ระดับง่าย (EASY)</div>
                <div className="text-[10px] opacity-80 mt-0.5">7 นาที • มีคำใบ้ช่วย</div>
              </button>

              {/* NORMAL */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setDifficulty('normal');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  difficulty === 'normal'
                    ? 'bg-apple-blue/20 border-apple-blue text-apple-teal shadow-glow-blue font-bold'
                    : 'bg-white/5 border-white/10 text-apple-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-black">ระดับปกติ (NORMAL)</div>
                <div className="text-[10px] opacity-80 mt-0.5">5 นาที • มาตรฐานบูธ</div>
              </button>

              {/* NIGHTMARE */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setDifficulty('nightmare');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  difficulty === 'nightmare'
                    ? 'bg-apple-red/20 border-apple-red text-apple-red shadow-glow-red font-bold'
                    : 'bg-white/5 border-white/10 text-apple-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-black">ฝันร้าย (NIGHTMARE)</div>
                <div className="text-[10px] opacity-80 mt-0.5">3 นาที • แจ้งเตือนสุ่มรบกวน</div>
              </button>
            </div>
          </div>

          {/* Time & Mission Preview */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#07090e] border border-white/5 font-sans text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-apple-gray-400">เวลาในภารกิจ:</span>
              <span className="text-base font-black text-white font-mono">{getMissionTimeText()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-apple-gray-400">ด่านทั้งหมด:</span>
              <span className="text-apple-teal font-bold">5 ด่านหลัก + บอสใหญ่</span>
            </div>
          </div>

          {/* Huge Start Mission Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-apple-blue via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg sm:text-xl font-sans tracking-wider shadow-glow-blue transition-all duration-300 transform active:scale-98 flex items-center justify-center space-x-3 cursor-pointer group"
          >
            <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
            <span>[ เริ่มต้นภารกิจ / START MISSION ]</span>
          </button>
        </div>

        {/* Bottom Subtitle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-sans text-apple-gray-300">
          <span>🛡️ ไม่ต้องมีพื้นฐานด้านความปลอดภัยไซเบอร์ก็เล่นได้</span>
          <span className="hidden sm:inline text-apple-gray-600">•</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowTips(true);
            }}
            className="text-apple-teal hover:underline flex items-center gap-1 cursor-pointer font-bold"
          >
            <BookOpen className="w-3.5 h-3.5" /> อ่านเคล็ดลับความปลอดภัย
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center font-sans text-[11px] text-apple-gray-500 z-10 py-2 flex items-center justify-center gap-1.5">
        <AppleLogo className="w-3.5 h-3.5 text-apple-gray-400" /> Mac Defender Security Ops • จำลองสถานการณ์เพื่อการเรียนรู้เท่านั้น ปลอดภัย 100%
      </footer>

      {/* Security Tips Modal */}
      <SecurityTipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
    </div>
  );
};
