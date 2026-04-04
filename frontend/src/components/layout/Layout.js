import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex selection:bg-blue-100 selection:text-blue-700 transition-colors duration-300">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="mx-auto max-w-7xl p-8 lg:p-10 ui-fade-in text-gray-900 dark:text-white transition-colors duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

