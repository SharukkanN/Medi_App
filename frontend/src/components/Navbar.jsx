import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

// 🔑 Adjust to your backend API base URL
const API_BASE = "http://localhost:4000/api";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navLinks = [
    { path: "/", label: "HOME" },
    { path: "/doctors", label: "ALL DOCTORS" },
    { path: "/about", label: "ABOUT" },
    { path: "/contact", label: "CONTACT" },
  ];

  // Load user from localStorage and validate with backend
  useEffect(() => {
    const loadUser = async () => {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (user && token) {
        try {
          // validate token with backend (optional but secure)
          const res = await fetch(`${API_BASE}/auth/validate`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            setLoggedInUser(JSON.parse(user));
          } else {
            // token invalid → force logout
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setLoggedInUser(null);
          }
        } catch (err) {
          console.error("Token validation failed:", err);
          setLoggedInUser(JSON.parse(user)); // fallback: just use local
        }
      } else {
        setLoggedInUser(null);
      }
    };

    loadUser();

    // Listen for login/logout across tabs
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLoggedInUser(null);
    navigate("/");
    window.dispatchEvent(new Event("storage")); // sync across tabs
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between text-sm py-4 px-6 border-b border-b-gray-300 bg-white">
      {/* Logo */}
      <h1
        className="text-3xl font-bold cursor-pointer"
        style={{ color: "#5f6FFF" }}
        onClick={() => navigate("/")}
      >
        MediPlus
      </h1>

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center gap-6 font-medium">
        {navLinks.map((link, idx) => (
          <NavLink key={idx} to={link.path}>
            <li className="py-1 hover:text-blue-600">{link.label}</li>
          </NavLink>
        ))}
      </ul>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {loggedInUser ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-8 h-8 rounded-full object-cover border"
              src={loggedInUser.profile_image || assets.profile_pic}
              alt="profile"
            />
            <img className="w-2.5" src={assets.dropdown_icon} alt="dropdown" />

            {/* Dropdown */}
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 flex flex-col gap-4 p-4 rounded-lg shadow-md">
                <p
                  onClick={() =>
                    navigate(`/my-profile/${loggedInUser.user_id}`)
                  }
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate("/my-appointments")}
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p
                  onClick={handleLogout}
                  className="hover:text-black cursor-pointer"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/signin")}
            className="bg-primary text-white px-6 py-2 rounded-full font-light hidden md:block"
          >
            Sign In
          </button>
        )}

        {/* Mobile Hamburger */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-7 cursor-pointer md:hidden"
          src={assets.menu_icon}
          alt="menu"
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          showMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1
            className="text-2xl font-bold cursor-pointer"
            style={{ color: "#5f6FFF" }}
            onClick={() => {
              navigate("/");
              setShowMenu(false);
            }}
          >
            MediPlus
          </h1>
          <img
            onClick={() => setShowMenu(false)}
            className="w-6 cursor-pointer"
            src={assets.cross_icon}
            alt="close"
          />
        </div>

        <ul className="flex flex-col gap-6 p-6 text-lg font-medium">
          {navLinks.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.path}
              onClick={() => setShowMenu(false)}
            >
              <li className="hover:text-blue-600">{link.label}</li>
            </NavLink>
          ))}

          {loggedInUser ? (
            <>
              <p
                onClick={() => {
                  navigate(`/my-profile/${loggedInUser.user_id}`);
                  setShowMenu(false);
                }}
                className="hover:text-black cursor-pointer"
              >
                My Profile
              </p>
              <p
                onClick={() => {
                  navigate("/my-appointments");
                  setShowMenu(false);
                }}
                className="hover:text-black cursor-pointer"
              >
                My Appointments
              </p>
              <p
                onClick={() => {
                  handleLogout();
                  setShowMenu(false);
                }}
                className="hover:text-black cursor-pointer"
              >
                Logout
              </p>
            </>
          ) : (
            <button
              onClick={() => {
                navigate("/signin");
                setShowMenu(false);
              }}
              className="bg-primary text-white px-6 py-3 rounded-full font-light"
            >
              Sign In
            </button>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
