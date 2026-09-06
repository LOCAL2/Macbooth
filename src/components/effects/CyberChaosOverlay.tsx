import React, { useState, useEffect } from 'react';
import { Shield, Phone, PhoneOff, AlertTriangle, BatteryWarning, Video, Flame, XCircle } from 'lucide-react';
import { ChaosTrollEvent } from '../../types/game.js';
import { soundEngine } from '../../services/soundEngine.js';

interface CyberChaosOverlayProps {
  event: ChaosTrollEvent | null;
  onDismiss: () => void;
}

export const CyberChaosOverlay: React.FC<CyberChaosOverlayProps> = ({ event, onDismiss }) => {
  const [defendClicks, setDefendClicks] = useState(0);

  useEffect(() => {
    if (!event) return;

    if (event.type === 'kernel_panic') {
      soundEngine.playKernelPanicGlitch();
    } else if (event.type === 'fake_call') {
      soundEngine.playFaceTimeRing();
    } else if (event.type === 'ransom_countdown') {
      soundEngine.playError();
      setDefendClicks(0);
    } else if (event.type === 'camera_spy') {
      soundEngine.playTerminalBeep();
    }

    const duration = event.durationMs || 4000;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [event, onDismiss]);

  if (!event) return null;

  // --- 1. KERNEL PANIC SIMULATION ---
  if (event.type === 'kernel_panic') {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white font-mono select-none animate-pulse">
        <div className="max-w-xl w-full bg-[#16181f]/95 border-2 border-white/20 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <span className="text-3xl">⏻</span>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-apple-red tracking-wide">
              {event.title}
            </h2>
            <p className="text-xs sm:text-sm text-apple-gray-300 leading-relaxed font-sans">
              {event.message}
            </p>
            <p className="text-[11px] text-apple-gray-500">
              Veuillez redémarrer votre ordinateur • 請重新啟動電腦 • 컴퓨터를 재시동하십시오
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onDismiss();
              }}
              className="px-6 py-2.5 rounded-xl bg-apple-red/20 hover:bg-apple-red/30 border border-apple-red text-apple-red font-bold text-xs cursor-pointer transition"
            >
              [ 😈 ปิดหน้าต่างแกล้ง / DISMISS TROLL ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. FAKE FACETIME CALL FROM HACKER ---
  if (event.type === 'fake_call') {
    return (
      <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce max-w-sm w-full">
        <div className="glass-panel-elevated bg-[#0f131d]/95 border-2 border-apple-red/50 rounded-3xl p-5 shadow-glow-red backdrop-blur-2xl text-white font-sans space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-apple-red/20 border border-apple-red flex items-center justify-center text-2xl animate-pulse">
              ☠️
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-apple-red font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-apple-red animate-ping" />
                FACETIME AUDIO โทรเข้า
              </div>
              <h3 className="text-sm font-black text-white truncate">
                {event.details?.caller || '☠️ UNKNOWN HACKER C2'}
              </h3>
              <p className="text-[10px] text-apple-gray-400 truncate">
                {event.details?.location || 'TOR PROXY [NODE 45.142.214]'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={() => {
                soundEngine.playEvilLaugh();
                onDismiss();
              }}
              className="flex-1 py-2.5 rounded-xl bg-apple-green hover:bg-green-600 text-black font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-glow-green transition"
            >
              <Phone className="w-4 h-4" />
              <span>รับสาย</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playSuccess();
                onDismiss();
              }}
              className="flex-1 py-2.5 rounded-xl bg-apple-red hover:bg-red-700 text-white font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-glow-red transition"
            >
              <PhoneOff className="w-4 h-4" />
              <span>ตัดสาย</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. FAKE DELETE PROGRESS BAR ---
  if (event.type === 'fake_delete') {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel-elevated bg-[#0e121a]/95 border border-apple-red/40 rounded-3xl p-6 shadow-2xl text-white font-mono space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-apple-red/20 border border-apple-red flex items-center justify-center text-apple-red">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">{event.title}</h3>
              <p className="text-[11px] text-apple-gray-400">Finder Operations • High I/O</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-apple-red truncate">{event.message}</div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div className="h-full bg-gradient-to-r from-apple-amber via-apple-red to-purple-600 rounded-full animate-pulse w-3/4" />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                soundEngine.playSuccess();
                onDismiss();
              }}
              className="px-4 py-2 rounded-xl bg-apple-red hover:bg-red-600 text-white font-sans font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-glow-red"
            >
              <XCircle className="w-4 h-4" />
              <span>[ กดเพื่อระงับการลบ / STOP HACK ]</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. RANSOMWARE COUNTDOWN ---
  if (event.type === 'ransom_countdown') {
    return (
      <div className="fixed top-16 inset-x-4 sm:inset-x-20 z-50">
        <div className="glass-panel bg-apple-red/90 border-2 border-white/30 rounded-2xl p-4 text-white font-sans shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <Flame className="w-6 h-6 text-apple-amber animate-bounce" />
            <div>
              <div className="text-xs font-black tracking-wider uppercase">{event.title}</div>
              <div className="text-[11px] text-white/90">{event.message}</div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playTerminalBeep();
              const next = defendClicks + 1;
              setDefendClicks(next);
              if (next >= 3) {
                soundEngine.playSuccess();
                onDismiss();
              }
            }}
            className="px-5 py-2 rounded-xl bg-white text-apple-red font-black text-xs hover:bg-apple-gray-100 cursor-pointer shadow-lg transition transform active:scale-95 whitespace-nowrap"
          >
            🛡️ กดยับยั้ง DEFEND ({defendClicks}/3)
          </button>
        </div>
      </div>
    );
  }

  // --- 5. LOW BATTERY SIMULATION ---
  if (event.type === 'low_battery') {
    return (
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4">
        <div className="glass-panel-elevated bg-[#121622]/95 border border-apple-amber/50 rounded-2xl p-4 text-white font-sans shadow-2xl space-y-3 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-apple-amber/20 flex items-center justify-center text-apple-amber">
            <BatteryWarning className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-apple-amber">{event.title}</h4>
            <p className="text-[11px] text-apple-gray-300 mt-1">{event.message}</p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onDismiss();
            }}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-apple-teal cursor-pointer"
          >
            เข้าใจแล้ว (สู้ต่อ!)
          </button>
        </div>
      </div>
    );
  }

  // --- 6. CAMERA SPY RECORDING PRANK ---
  if (event.type === 'camera_spy') {
    return (
      <div className="fixed top-20 left-4 sm:left-8 z-50 max-w-xs w-full animate-fade-in">
        <div className="glass-panel-elevated bg-[#0b0e14]/95 border border-apple-green/50 rounded-2xl p-3.5 shadow-glow-green text-white font-mono space-y-2 text-xs">
          <div className="flex items-center justify-between text-[10px] text-apple-green font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-apple-green animate-ping" />
              WEBCAM ACCESS (SIMULATION)
            </span>
            <Video className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] text-apple-gray-300 font-sans">
            {event.message}
          </p>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                onDismiss();
              }}
              className="text-[10px] text-apple-teal hover:underline cursor-pointer"
            >
              [ ปิดการแจ้งเตือน ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return null;
};
