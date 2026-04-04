import React from 'react';

const accentColors = {
  blue: 'from-blue-500 to-blue-600',
  indigo: 'from-indigo-500 to-indigo-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
};

export default function StatCard({ title, value, subtitle, icon, className = '', trend, accentColor = 'blue', isEmpty }) {
  const gradient = accentColors[accentColor] || accentColors.blue;

  return (
    <div
      className={[
        'group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md hover:shadow-xl',
        'border border-gray-100 dark:border-slate-800',
        'transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]',
        'overflow-hidden cursor-default',
        className,
      ].join(' ')}
    >
      {/* Top accent gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Subtle ambient glow behind icon on hover */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.06] rounded-full blur-2xl transition-opacity duration-500`} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            {title}
          </p>
          <div className="mt-3">
            {isEmpty ? (
              <p className="text-2xl font-bold text-gray-300 dark:text-slate-600">—</p>
            ) : (
              <h3 className="text-[1.75rem] font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
                {value}
              </h3>
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-xs font-medium text-gray-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ml-4 shrink-0`}>
          <span className="text-white text-lg filter drop-shadow-sm">{icon}</span>
        </div>
      </div>
    </div>
  );
}
