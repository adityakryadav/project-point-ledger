import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex selection:bg-blue-100 selection:text-blue-700">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="mx-auto max-w-7xl p-8 lg:p-10 ui-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

