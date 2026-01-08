import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Settings, Truck, LogOut, Ship } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/orders', label: 'Orders', icon: Package }, // Assuming you might split these later
    { path: '/shipments', label: 'Shipments', icon: Truck }, // Future: History page
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col justify-between hidden md:flex">
      {/* Logo Section */}
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Ship size={20} />
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-tight">ShipLite</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;