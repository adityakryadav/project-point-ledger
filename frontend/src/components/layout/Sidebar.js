import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const linkClassName = ({ isActive }) =>
    [
      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative',
      isActive
        ? 'bg-blue-600/10 text-blue-400 shadow-sm border border-blue-500/20'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
      isCollapsed ? 'justify-center px-2' : '',
    ].join(' ');

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 dark:bg-black flex flex-col h-screen sticky top-0 hidden lg:flex border-r border-gray-800 transition-all duration-300 overflow-hidden`}>
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-6 transition-all duration-300`}>
        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md shrink-0">
          <img 
            src="/logo.png" 
            alt="Point Ledger" 
            className="h-8 w-auto object-contain drop-shadow-[0_4px_16px_rgba(99,102,241,0.6)]" 
          />
        </div>
        {!isCollapsed && <span className="text-xl font-black text-white tracking-tight uppercase whitespace-nowrap ui-fade-in">Point Ledger</span>}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <NavLink to="/dashboard" className={linkClassName}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full ui-fade-in" />}
              <svg className={['w-5 h-5 transition-colors duration-300 shrink-0', isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              {!isCollapsed && <span className="whitespace-nowrap transition-all duration-300">Dashboard</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/exchange" className={linkClassName}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full ui-fade-in" />}
              <svg className={['w-5 h-5 transition-colors duration-300 shrink-0', isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {!isCollapsed && <span className="whitespace-nowrap transition-all duration-300">Exchange</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/transactions" className={linkClassName}>
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full ui-fade-in" />}
              <svg className={['w-5 h-5 transition-colors duration-300 shrink-0', isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {!isCollapsed && <span className="whitespace-nowrap transition-all duration-300">Transactions</span>}
            </>
          )}
        </NavLink>
      </nav>

      <div className="p-4 mt-auto space-y-4 border-t border-gray-800/50">
        {!isCollapsed && (
          <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/50 shadow-inner ui-fade-in transition-all duration-300">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2.5">Portfolio Value</p>
            <p className="text-xl font-black text-white tracking-tight">₹ 1,82,450.75</p>
            <div className="mt-4 w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden border border-gray-700/30">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[70%] shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-3 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-300"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg 
            className={`w-6 h-6 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  );
  );
}

