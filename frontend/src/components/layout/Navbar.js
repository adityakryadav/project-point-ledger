import React from 'react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="px-8 h-16 flex items-center justify-between">
        <div className="flex items-center lg:hidden gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="font-black text-slate-900 tracking-tight uppercase text-sm">Point Ledger</span>
        </div>

        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management Terminal • Stable</h2>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
            <svg className="w-5.5 h-5.5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="h-8 w-px bg-slate-200/60" />
          
          <div className="flex items-center gap-3.5 pl-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">Jashwanth</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">System Admin</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-xs shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300">
              JW
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

