import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  sublabel,
  showPercentage = true,
  colorClass = 'bg-gradient-to-r from-amber-500 to-orange-600',
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="w-full">
      {(label || sublabel || showPercentage) && (
        <div className="flex justify-between items-baseline mb-1.5 text-sm">
          {label && <span className="font-semibold text-stone-700">{label}</span>}
          <div className="flex items-center gap-2 ml-auto">
            {sublabel && <span className="text-xs text-stone-500">{sublabel}</span>}
            {showPercentage && (
              <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-xs">
                {percentage}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden shadow-inner relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
