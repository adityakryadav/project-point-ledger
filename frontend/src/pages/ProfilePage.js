import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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

  const handleSave = async () => {
    if (!editData.name || !editData.email) {
      toast.error('All fields are required');
      return;
    }

    setIsSaving(true);
    // Simulate save logic with delay
    await new Promise(res => setTimeout(res, 800));
    
    updateUser({
      name: editData.name,
      email: editData.email
    });

    setIsSaving(false);
    setIsEditOpen(false);
    toast.success('Profile updated successfully');
  };

  const initials = displayUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="ui-fade-in-up transition-colors duration-300">
      <div className="max-w-lg mx-auto mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
          {/* Header/Cover background */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600" />
          
          <div className="p-8 pt-0 relative">
            {/* Avatar container */}
            <div className="relative -mt-16 mb-6">
              <div className="h-32 w-32 rounded-3xl bg-white dark:bg-gray-800 p-1.5 shadow-2xl mx-auto transition-all duration-300">
                <div className="h-full w-full rounded-[1.25rem] bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-4xl font-black transition-all duration-300">
                  {initials}
                </div>
              </div>
              <div className="absolute bottom-2 right-[calc(50%-64px)] bg-emerald-500 h-5 w-5 rounded-full border-4 border-white dark:border-gray-800 shadow-sm" title="Active" />
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors duration-300">{displayUser.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">{displayUser.email}</p>
              <div className="pt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-600 transition-all duration-300">
                  {displayUser.role || 'System Admin'}
                </span>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors duration-300">Account Security</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">Two-Factor Authentication: <span className="text-emerald-600 dark:text-emerald-400">Enabled</span></p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors duration-300">Last Login</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">March 27, 2026 • 10:45 AM (Local Time)</p>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 active:scale-[0.98]"
              >
                Edit Profile
              </button>
              <button className="px-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold py-3 rounded-xl transition-all duration-300">
                Settings
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-gray-400 dark:text-gray-600 text-xs font-bold uppercase tracking-widest transition-colors duration-300">
          Member since 2024 • ID: PL-88294
        </p>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 ui-fade-in-up transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Edit Profile</h2>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 pl-1 transition-colors duration-300">Full Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  disabled={isSaving}
                  placeholder="Your full name"
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 pl-1 transition-colors duration-300">Email Address</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  disabled={isSaving}
                  placeholder="name@company.com"
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => !isSaving && setIsEditOpen(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

