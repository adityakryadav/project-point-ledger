import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleProfile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("PROFILE CLICKED");
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("LOGOUT CLICKED");
    setIsDropdownOpen(false);
    localStorage.clear();
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="px-8 h-16 flex items-center justify-between">
        <div className="flex items-center lg:hidden gap-3">
          <div className="flex items-center lg:hidden">
            <img src="/logo.png" alt="Point Ledger" className="h-10 w-auto object-contain" />
          </div>
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
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3.5 pl-2 group focus:outline-none cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{user?.name || 'Guest'}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">System Admin</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 font-black text-xs shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                {initials}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 ui-fade-in z-50">
                <button 
                  onClick={handleProfile}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

