// src/pages/admin/AdminDashboard.jsx
import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUserMd,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { NavLink, useNavigate, Outlet } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { name: "Appointments", icon: <FaCalendarAlt />, path: "/admin/appointments" },
    { name: "Doctors", icon: <FaUserMd />, path: "/admin/doctors" },
    { name: "Users", icon: <FaUsers />, path: "/admin/users" },
    //{ name: "Settings", icon: <FaCog />, path: "/admin/settings" },
    { name: "Logout", icon: <FaSignOutAlt />, path: "/signin" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div className="flex h-screen bg-[#FEEDD6]">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#5F6FFF] text-white flex flex-col z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 text-3xl font-bold text-center border-b border-[#FEEDD6]">
          MEDIPLUS
        </div>

        {/* Menu Items */}
        <div className="flex-1 mt-6">
          {menuItems.map((item) =>
            item.name === "Logout" ? (
              <button
                key={item.name}
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-6 py-3 text-left rounded-lg mb-2 transition-all duration-300 hover:bg-white hover:text-[#5F6FFF] font-semibold"
              >
                {item.icon} <span>{item.name}</span>
              </button>
            ) : (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full px-6 py-3 text-left rounded-lg mb-2 transition-all duration-300 font-semibold ${
                    isActive ? "bg-white text-[#5F6FFF]" : "hover:bg-white hover:text-[#5F6FFF]"
                  }`
                }
                onClick={() => setSidebarOpen(false)} // close on mobile
              >
                {item.icon} <span>{item.name}</span>
              </NavLink>
            )
          )}
        </div>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 text-[#5F6FFF] text-2xl"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <FaBars />
      </button>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:ml-64 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
