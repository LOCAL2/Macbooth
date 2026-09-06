import React from 'react';

interface CyberEffectsProps {
  threatLevel: number;
  scanlinesEnabled?: boolean;
  isErrorShaking?: boolean;
  children: React.ReactNode;
}

export const CyberEffects: React.FC<CyberEffectsProps> = ({
  threatLevel,
  scanlinesEnabled = true,
  isErrorShaking = false,
  children,
}) => {
  const isCritical = threatLevel >= 75;
  const isWarning = threatLevel >= 50 && threatLevel < 75;

  return (
    <div
      className={`relative min-h-screen w-full bg-[#06080d] overflow-x-hidden ${
        isErrorShaking ? 'error-shake' : isCritical ? 'shake-screen' : ''
      }`}
    >
      {/* Red Damage Screen Flash on Wrong Answer */}
      {isErrorShaking && (
        <div className="fixed inset-0 error-red-flash pointer-events-none z-50" />
      )}

      {/* Background Cyber Grid */}
      <div className="fixed inset-0 cyber-grid opacity-25 pointer-events-none z-0"></div>

      {/* Atmospheric Glow gradients */}
      <div
        className={`fixed -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-700 z-0 ${
          isErrorShaking || isCritical
            ? 'bg-apple-red/35'
            : isWarning
            ? 'bg-apple-amber/20'
            : 'bg-apple-blue/15'
        }`}
      />
      <div
        className={`fixed -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-700 z-0 ${
          isErrorShaking || isCritical
            ? 'bg-apple-red/30'
            : isWarning
            ? 'bg-apple-purple/15'
            : 'bg-apple-green/10'
        }`}
      />

      {/* Critical Red Vignette Pulse */}
      {(isCritical || isErrorShaking) && (
        <div className="fixed inset-0 pointer-events-none z-40 border-[8px] border-apple-red/70 animate-pulse-fast shadow-[inset_0_0_100px_rgba(255,69,58,0.5)]" />
      )}

      {/* Subtle Scanline Overlay for Retina Clarity */}
      {scanlinesEnabled && (
        <div className="fixed inset-0 scanline-overlay pointer-events-none z-50 opacity-15" />
      )}

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
