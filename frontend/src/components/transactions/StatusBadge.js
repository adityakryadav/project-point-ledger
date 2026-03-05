import React from 'react';

const stylesByStatus = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  const styles = stylesByStatus[normalized] || 'bg-slate-50 text-slate-600 border-slate-200';
  const label = normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Unknown';

  return (
    <span className={['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border', styles].join(' ')}>
      <span className={['mr-1.5 h-1.5 w-1.5 rounded-full', 
        normalized === 'success' ? 'bg-emerald-500' : 
        normalized === 'pending' ? 'bg-amber-500' : 
        normalized === 'failed' ? 'bg-rose-500' : 'bg-slate-400'
      ].join(' ')} />
      {label}
    </span>
  );
}

