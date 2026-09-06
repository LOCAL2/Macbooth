import React from 'react';
import { Shield, X, CheckCircle2 } from 'lucide-react';
import { SECURITY_TIPS } from '../../data/missionsData.js';
import { soundEngine } from '../../services/soundEngine.js';
import { AppleLogo } from '../ui/AppleLogo.js';

interface SecurityTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityTipsModal: React.FC<SecurityTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="max-w-2xl w-full glass-panel-elevated rounded-2xl border border-white/10 shadow-2xl font-sans max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e121a]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-white border border-white/20">
              <AppleLogo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                คู่มือสรุปความปลอดภัย Mac ฉบับเข้าใจง่าย
              </h2>
              <p className="text-xs text-apple-gray-400 font-mono">
                กฎเหล็ก 5 ข้อเพื่อความปลอดภัยในการท่องเว็บและทำงานประจำวัน
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-apple-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tips Content List */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono">
          {SECURITY_TIPS.map((tip) => (
            <div
              key={tip.id}
              className="bg-[#080b11] border border-white/5 hover:border-apple-blue/30 rounded-xl p-4 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tip.icon}</span>
                  <span className="text-xs font-bold text-apple-teal uppercase font-sans">
                    {tip.category}
                  </span>
                </div>
                <span className="text-[10px] text-apple-gray-500 font-mono">
                  หมวด: {tip.id}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white font-sans">
                {tip.title}
              </h3>

              <div className="text-xs font-bold text-apple-green flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{tip.rule}</span>
              </div>

              <p className="text-xs text-apple-gray-300 font-sans leading-relaxed pt-1">
                {tip.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0e121a] border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-bold text-xs font-sans shadow-glow-blue transition cursor-pointer"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
