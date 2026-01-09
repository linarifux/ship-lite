import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Ship } from 'lucide-react'; // Import Menu icon

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* SIDEBAR (Responsive) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* MOBILE HEADER (Only visible on small screens) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:hidden sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Ship size={20} />
              </div>
              <span className="text-lg font-bold text-gray-800 tracking-tight">ShipLite</span>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default AdminLayout;