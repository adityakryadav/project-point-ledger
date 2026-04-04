import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: '/exchange',
    label: 'Exchange',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gray-950 dark:bg-black flex flex-col h-screen sticky top-0 hidden lg:flex border-r border-gray-800/60 transition-all duration-300 overflow-hidden`}
    >
      {/* Logo */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-6 transition-all duration-300`}>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
          <img
            src="/logo.png"
            alt="Point Ledger"
            className="h-7 w-auto object-contain"
          />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-black text-white tracking-tight uppercase whitespace-nowrap ui-fade-in">
            Point Ledger
          </span>
        )}
      </div>

      {/* Section label */}
      {!isCollapsed && (
        <p className="px-5 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          Navigation
        </p>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                isCollapsed ? 'justify-center px-2' : '',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-white' : ''}>{icon}</span>
                {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
                {!isCollapsed && isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-white/60" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Portfolio card */}
      {!isCollapsed && (
        <div className="mx-3 mb-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700/60 shadow-inner ui-fade-in">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Portfolio Value</p>
          <p className="text-xl font-black text-white tracking-tight">₹ 1,82,450.75</p>
          <div className="mt-3 w-full bg-gray-700/50 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[70%] shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5 font-medium">70% of monthly target</p>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="p-3 border-t border-gray-800/60">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-3 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-200"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`}
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
}
