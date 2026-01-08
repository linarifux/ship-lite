import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Header (Only visible on small screens) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden shrink-0">
          <span className="font-bold text-gray-800">ShipLite</span>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* This is where Dashboard or Settings renders */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;