import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Truck, LogOut, Ship, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => { // Accept isOpen and onClose props
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/shipments', label: 'Shipments', icon: Truck },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('shop_connected');
    localStorage.removeItem('shop_name');
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      {/* MOBILE OVERLAY (Backdrop) */}
      {/* Only visible on mobile when sidebar is open */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 
          z-40 transition-transform duration-300 ease-in-out flex flex-col justify-between
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
        `}
      >
        {/* Logo Section */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Ship size={20} />
              </div>
              <span className="text-lg font-bold text-gray-800 tracking-tight">ShipLite</span>
            </div>
            
            {/* Close Button (Mobile Only) */}
            <button 
              onClick={onClose} 
              className="md:hidden text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose} // Close sidebar when clicking a link on mobile
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section (User/Logout) */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;