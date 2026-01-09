import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Shipments from "./pages/Shipments"; // <--- Import this
import ScrollToTop from "./components/utils/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/shipments" element={<Shipments />} />{" "}
          {/* <--- Add Route */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
