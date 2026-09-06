import React from 'react';

interface MacWindowProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  statusBadge?: React.ReactNode;
  isThreatElevated?: boolean;
}

export const MacWindow: React.FC<MacWindowProps> = ({
  title = 'Terminal',
  subtitle,
  icon,
  children,
  className = '',
  headerAction,
  statusBadge,
  isThreatElevated = false,
}) => {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
        isThreatElevated ? 'glass-alert border-apple-red/50 shadow-glow-red' : 'glass-panel-elevated border-white/10'
      } ${className}`}
    >
      {/* macOS Window Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111622]/90 border-b border-white/5 select-none">
        <div className="flex items-center space-x-2">
          {/* Traffic light buttons */}
          <span className="traffic-btn traffic-btn-close hover:opacity-80 cursor-pointer"></span>
          <span className="traffic-btn traffic-btn-min hover:opacity-80 cursor-pointer"></span>
          <span className="traffic-btn traffic-btn-max hover:opacity-80 cursor-pointer"></span>

          {icon && <div className="ml-2 text-apple-blue">{icon}</div>}
          <div className="ml-2 flex items-baseline space-x-2">
            <span className="text-xs font-semibold text-apple-gray-200 tracking-wide font-mono">
              {title}
            </span>
            {subtitle && (
              <span className="text-[11px] text-apple-gray-400 font-mono hidden sm:inline">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {statusBadge}
          {headerAction}
        </div>
      </div>

      {/* Window Body */}
      <div className="p-4 sm:p-6 text-apple-gray-100">{children}</div>
    </div>
  );
};
