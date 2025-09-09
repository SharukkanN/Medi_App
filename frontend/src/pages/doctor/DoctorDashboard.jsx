// src/pages/doctor/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBars,
  FaStethoscope,
} from "react-icons/fa";
import { NavLink, useNavigate, Outlet, useParams } from "react-router-dom";

const DoctorDashboard = () => {
  const { id } = useParams(); // doctor_id from route
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      setDoctor(JSON.parse(storedDoctor));
    } else {
      navigate("/signin"); // redirect if not logged in
    }
  }, [navigate]);

  const menuItems = [
    { name: "My Profile", icon: <FaUser />, path: `/doctor-panel/${id}/profile` },
    { name: "My Appointments", icon: <FaCalendarAlt />, path: `/doctor-panel/${id}/appointments` },
    { name: "Logout", icon: <FaSignOutAlt />, path: "/signin" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("doctor");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  if (!doctor) return null;

  return (
    <div className="flex h-screen bg-[#FEEDD6]">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#5F6FFF] text-white flex flex-col z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 text-2xl font-bold text-center border-b border-white flex items-center justify-center gap-2">
          <FaStethoscope /> Dr. Panel
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
                    isActive
                      ? "bg-white text-[#5F6FFF]"
                      : "hover:bg-white hover:text-[#5F6FFF]"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon} <span>{item.name}</span>
              </NavLink>
            )
          )}
        </div>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 text-[#4CAF50] text-2xl"
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

export default DoctorDashboard;
