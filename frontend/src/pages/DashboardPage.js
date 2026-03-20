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
    <div className="space-y-8 ui-fade-in-up transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Executive Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors duration-300">Real-time overview of your financial ledger and point activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex flex-col items-center transition-all duration-300">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors duration-300">{formattedDate}</span>
            <span className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">{time}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Points"
          value="1,24,500"
          subtitle="Available for exchange"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          trend={{ value: '12%', isUp: true }}
          accent
        />
        <StatCard
          title="Available Balance"
          value="₹ 93,375"
          subtitle="Ready to withdraw"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="Points Exchanged"
          value="45,000"
          subtitle="Total lifetime"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
        />
        <StatCard
          title="Active Requests"
          value="2"
          subtitle="Processing now"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300">
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm transition-colors duration-300">System Insights</h3>
            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase">Automated</span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Exchanged Points', value: '7,420', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Verified Credits', value: '₹ 12,900', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Pending Requests', value: '3', color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Platform Fees', value: '₹ 248', color: 'text-gray-600 dark:text-gray-400' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight transition-colors duration-300">{item.label}</p>
                <p className={`text-xl font-black mt-1 ${item.color} transition-colors duration-300`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300">
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm transition-colors duration-300">Loyalty Progression</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors duration-300">Current Tier</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 transition-colors duration-300">Platinum Member</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white font-black shadow-lg">
                P
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase transition-colors duration-300">
                <span>62% to Diamond</span>
                <span>8,400 pts more</span>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[62%] shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg transition-all duration-300">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight transition-colors duration-300">Active Benefit</p>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mt-1 leading-relaxed transition-colors duration-300">
                You're currently enjoying <span className="font-black underline decoration-blue-300 dark:decoration-blue-700">15% lower transaction fees</span> on all point exchanges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

