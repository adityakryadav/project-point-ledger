import React from 'react';
import StatusBadge from './StatusBadge';

function formatAmount(amount) {
  if (typeof amount !== 'number') return amount;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount);
}

export default function TransactionsTable({ rows, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="h-5 w-32 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-40 bg-slate-200 animate-pulse rounded" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 flex-1 bg-slate-100 animate-pulse rounded-lg" />
              <div className="h-10 flex-1 bg-slate-100 animate-pulse rounded-lg" />
              <div className="h-10 flex-1 bg-slate-100 animate-pulse rounded-lg" />
              <div className="h-10 flex-1 bg-slate-100 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Sync Failed</h3>
        <p className="text-slate-500 mt-2 max-w-xs mx-auto">{error}</p>
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Transaction Ledger</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Showing all recent point activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg border border-transparent hover:border-slate-200 hover:bg-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4 border-b border-slate-100">Reference ID</th>
              <th className="px-6 py-4 border-b border-slate-100">Processing Date</th>
              <th className="px-6 py-4 border-b border-slate-100 text-right">Settlement (INR)</th>
              <th className="px-6 py-4 border-b border-slate-100">System Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="group hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-tighter">
                    {r.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">
                      {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Confirmed</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-black ${r.amount >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {r.amount >= 0 ? '+' : ''}₹ {formatAmount(Math.abs(r.amount))}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {rows.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No activity found</p>
        </div>
      )}
    </div>
  );
}

