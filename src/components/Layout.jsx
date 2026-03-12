import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div>
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="main-layout">
        <Sidebar collapsed={collapsed} />

        <div className={`page-content ${collapsed ? "expanded" : ""}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
