import React, { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';

export default function DashboardPage() {
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const time = today.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8 ui-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time overview of your financial ledger and point activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex flex-col items-center">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{formattedDate}</span>
            <span className="text-xs text-gray-500 dark:text-slate-500">{time}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Wallet Balance"
          value="₹ 1,82,450.75"
          subtitle="Settled & ready for payout"
          trend={{ value: '12.5%', isUp: true }}
          accent
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Points"
          value="49,200"
          subtitle="Available for exchange"
          trend={{ value: '8.2%', isUp: true }}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
        <StatCard
          title="Monthly Exchanges"
          value="₹ 12,900"
          subtitle="Volume processed this month"
          trend={{ value: '2.4%', isUp: false }}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">System Insights</h3>
            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase">Automated</span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Exchanged Points', value: '7,420', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Verified Credits', value: '₹ 12,900', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Pending Requests', value: '3', color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Platform Fees', value: '₹ 248', color: 'text-slate-600 dark:text-slate-400' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 transition-hover hover:border-blue-200 dark:hover:border-blue-800">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{item.label}</p>
                <p className={`text-xl font-black mt-1 ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Loyalty Progression</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Tier</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">Platinum Member</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                P
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                <span>62% to Diamond</span>
                <span>8,400 pts more</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[62%] shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight">Active Benefit</p>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mt-1 leading-relaxed">
                You're currently enjoying <span className="font-black underline decoration-blue-300 dark:decoration-blue-700">15% lower transaction fees</span> on all point exchanges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

