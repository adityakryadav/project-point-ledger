import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Use mock data if user from context is not available
  const displayUser = user || {
    name: "Jashwanth",
    email: "jash@example.com",
    role: "System Admin"
  };

  const [editData, setEditData] = useState({
    name: displayUser.name,
    email: displayUser.email
  });

  const initials = displayUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="ui-fade-in-up">
      <div className="max-w-lg mx-auto mt-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header/Cover background */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600" />
          
          <div className="p-8 pt-0 relative">
            {/* Avatar container */}
            <div className="relative -mt-16 mb-6">
              <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-2xl mx-auto">
                <div className="h-full w-full rounded-[1.25rem] bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-indigo-600 text-4xl font-black">
                  {initials}
                </div>
              </div>
              <div className="absolute bottom-2 right-[calc(50%-64px)] bg-emerald-500 h-5 w-5 rounded-full border-4 border-white shadow-sm" title="Active" />
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{displayUser.name}</h1>
              <p className="text-slate-500 font-medium">{displayUser.email}</p>
              <div className="pt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest border border-slate-200">
                  {displayUser.role || 'System Admin'}
                </span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Security</p>
                <p className="text-sm font-bold text-slate-700">Two-Factor Authentication: <span className="text-emerald-600">Enabled</span></p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Login</p>
                <p className="text-sm font-bold text-slate-700">March 27, 2026 • 10:45 AM (Local Time)</p>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-[0.98]"
              >
                Edit Profile
              </button>
              <button className="px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition-all duration-300">
                Settings
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Member since 2024 • ID: PL-88294
        </p>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-100 ui-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Full Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Email Address</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsEditOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditOpen(false)}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

