import React from 'react';

export default function StatCard({ title, value, subtitle, icon, className = '', trend, accent }) {
  return (
    <div
      className={[
        'bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-300 relative overflow-hidden',
        'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]',
        className,
      ].join(' ')}
    >
      {accent && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
      )}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs font-semibold text-slate-400 mt-1">{subtitle}</p>}
          
          {trend && (
            <div className="mt-4 flex items-center gap-1.5">
              <span className={[
                'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight',
                trend.isUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
              ].join(' ')}>
                {trend.isUp ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">vs last month</span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

