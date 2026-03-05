import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const linkClassName = ({ isActive }) =>
    [
      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative',
      isActive
        ? 'bg-blue-600/10 text-blue-400 shadow-sm border border-blue-500/20'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
    ].join(' ');

  return (
    <aside className="w-64 bg-[#0f172a] flex flex-col h-screen sticky top-0 hidden lg:flex border-r border-slate-800/50">
      <div className="p-8 flex items-center gap-3.5">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.3" />
          </svg>
        </div>
        <span className="text-xl font-black text-white tracking-tight uppercase">Point Ledger</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/dashboard" className={linkClassName}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full ui-fade-in" />}
              <svg className={['w-5 h-5 transition-colors duration-300', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </>
          )}
        </NavLink>
        <NavLink to="/exchange" className={linkClassName}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full ui-fade-in" />}
              <svg className={['w-5 h-5 transition-colors duration-300', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Exchange
            </>
          )}
        </NavLink>
        <NavLink to="/transactions" className={linkClassName}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full ui-fade-in" />}
              <svg className={['w-5 h-5 transition-colors duration-300', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Transactions
            </>
          )}
        </NavLink>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 shadow-inner">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Portfolio Value</p>
          <p className="text-xl font-black text-white tracking-tight">₹ 1,82,450.75</p>
          <div className="mt-4 w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden border border-slate-700/30">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[70%] shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
          </div>
        </div>
      </div>
    </aside>
  );
}

