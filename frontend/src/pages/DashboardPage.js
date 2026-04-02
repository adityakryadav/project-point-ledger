import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';

const currencyFields = new Set(['walletBalance', 'verifiedCredits', 'platformFees']);

const formatValue = (value, field) => {
  const number = typeof value === 'number' ? value : Number(value);
  const safe = Number.isFinite(number) ? number : 0;
  if (currencyFields.has(field)) {
    return `₹ ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(safe)}`;
  }
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(safe);
};

const defaultDashboard = {
  totalPoints: 0,
  walletBalance: 0,
  exchangedPoints: 0,
  activeRequests: 0,
  verifiedCredits: 0,
  pendingRequests: 0,
  platformFees: 0,
};

const cards = [
  { key: 'totalPoints',     label: 'Total Points',      subtitle: 'Available for exchange', icon: '⛳', accentColor: 'blue' },
  { key: 'walletBalance',   label: 'Wallet Balance',    subtitle: 'Ready to withdraw',      icon: '💰', accentColor: 'emerald' },
  { key: 'exchangedPoints', label: 'Points Exchanged',  subtitle: 'Lifetime total',         icon: '🔁', accentColor: 'indigo' },
  { key: 'activeRequests',  label: 'Active Requests',   subtitle: 'In progress',            icon: '⏳', accentColor: 'amber' },
];

const insights = [
  { key: 'verifiedCredits', label: 'Verified Credits',  icon: '✅', color: 'emerald' },
  { key: 'pendingRequests', label: 'Pending Requests',  icon: '🕐', color: 'amber' },
  { key: 'platformFees',    label: 'Platform Fees',     icon: '💸', color: 'indigo' },
];

const colorMap = {
  emerald: { text: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/40' },
  amber:   { text: 'text-amber-500 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-100 dark:border-amber-800/40' },
  indigo:  { text: 'text-indigo-500 dark:text-indigo-400',   bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-800/40' },
};

export default function DashboardPage() {
  const { user, dashboard, updateDashboard, transactions } = useAuth();
  const [displayDashboard, setDisplayDashboard] = useState(defaultDashboard);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const hasActivity = useMemo(() => Object.values(dashboard).some((v) => Number(v) > 0), [dashboard]);

  useEffect(() => {
    const start = Date.now();
    const duration = 700;
    const from = displayDashboard;
    const to = { ...defaultDashboard, ...dashboard };

    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
      const next = {};
      Object.keys(to).forEach((key) => {
        const begin = Number(from[key] || 0);
        const end = Number(to[key] || 0);
        next[key] = begin + (end - begin) * ease;
      });
      setDisplayDashboard(next);
      if (t < 1) requestAnimationFrame(step);
    };
    step();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard]);

  const handleReset = () => {
    updateDashboard(defaultDashboard);
    localStorage.setItem(`dashboard_${user?.email}`, JSON.stringify(defaultDashboard));
    localStorage.setItem(`transactions_${user?.email}`, JSON.stringify([]));
  };

  const handleSimulateRequest = () => {
    updateDashboard({
      activeRequests: (dashboard.activeRequests || 0) + 1,
      pendingRequests: (dashboard.pendingRequests || 0) + 1,
    });
  };

  return (
    <div
      className={`space-y-8 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* ── Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 p-8 shadow-xl shadow-blue-500/20 dark:shadow-none border border-blue-500/20 dark:border-slate-700/50">
        {/* Ambient blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-blue-100 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
              Executive Dashboard
            </p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="mt-1.5 text-blue-200 dark:text-slate-500 text-sm font-medium">
              Here's a real-time overview of your ledger.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleSimulateRequest}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              Simulate Request
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm font-semibold backdrop-blur-sm border border-white/10 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => {
          const raw = displayDashboard[card.key] ?? 0;
          const isEmpty = dashboard[card.key] === 0 || dashboard[card.key] === undefined;
          return (
            <StatCard
              key={card.key}
              title={card.label}
              value={formatValue(raw, card.key)}
              subtitle={card.subtitle}
              icon={card.icon}
              accentColor={card.accentColor}
              isEmpty={isEmpty}
            />
          );
        })}
      </div>

      {/* ── No Activity Banner ── */}
      {!hasActivity && (
        <div className="flex flex-col items-center justify-center py-10 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-dashed border-gray-200 dark:border-slate-700 text-center gap-2">
          <span className="text-4xl">📭</span>
          <p className="font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-xs">No activity yet</p>
          <p className="text-sm text-gray-400 dark:text-slate-600">Use the simulator above to generate test data.</p>
        </div>
      )}

      {/* ── Insight Metrics ── */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          Platform Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((item) => {
            const value = dashboard[item.key] || 0;
            const c = colorMap[item.color];
            const empty = value === 0;
            return (
              <div
                key={item.key}
                className={`group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border ${c.border} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className={`h-11 w-11 rounded-xl ${c.bg} flex items-center justify-center text-xl shrink-0`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                    {item.label}
                  </p>
                  <p className={`text-xl font-extrabold mt-0.5 transition-colors duration-300 ${empty ? 'text-gray-300 dark:text-slate-600' : c.text}`}>
                    {empty ? '—' : formatValue(value, item.key)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Transaction Summary ── */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-transparent dark:from-blue-950/20 dark:to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Transaction Ledger
            </p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
              {transactions?.length ?? 0}{' '}
              <span className="text-base font-semibold text-gray-400 dark:text-slate-500">
                {transactions?.length === 1 ? 'transaction' : 'transactions'}
              </span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>
        {transactions?.length === 0 && (
          <p className="relative z-10 mt-3 text-xs text-gray-400 dark:text-slate-600 font-medium">
            No transactions recorded yet. Head to Exchange to initiate one.
          </p>
        )}
      </div>
    </div>
  );
}
