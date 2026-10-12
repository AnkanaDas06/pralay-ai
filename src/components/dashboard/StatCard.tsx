import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'critical' | 'high' | 'moderate' | 'low' | 'cyan' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  badge,
  badgeVariant = 'neutral',
  onClick,
}) => {
  const badgeStyles = {
    critical: 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-glow-red font-bold',
    high: 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-glow-orange font-bold',
    moderate: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold',
    low: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-green font-bold',
    cyan: 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-glow-blue font-bold',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700 font-bold',
  }[badgeVariant];

  const iconStyles = {
    critical: 'bg-red-950/60 text-red-400 border-red-800/60',
    high: 'bg-orange-950/60 text-orange-400 border-orange-800/60',
    moderate: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
    low: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    cyan: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
    neutral: 'bg-[#101a35] text-blue-400 border-blue-900/40',
  }[badgeVariant];

  return (
    <div 
      onClick={onClick}
      className={`relative p-4 rounded-xl bg-[#0b1328] border border-blue-900/40 hover:border-blue-500/50 transition-all duration-200 shadow-panel ${
        onClick ? 'cursor-pointer hover:bg-[#101a35]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${iconStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
          {value}
        </span>
        {badge && (
          <span className={`px-2 py-0.5 text-[10px] uppercase rounded-md font-mono ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>

      {subValue && (
        <p className="text-[11px] text-slate-400 mt-1.5 truncate font-medium">
          {subValue}
        </p>
      )}
    </div>
  );
};
