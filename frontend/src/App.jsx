import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      {/* Wrap all admin pages in the Layout */}
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Dashboard />} /> {/* Reusing Dashboard for now */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/shipments" element={<div className="p-4">Shipment History (Coming Soon)</div>} />
      </Route>
      
      {/* Login/Public routes would go here, OUTSIDE the AdminLayout */}
    </Routes>
  );
}

export default App;