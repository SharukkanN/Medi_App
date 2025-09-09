// src/App.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";

// User Pages
import Home from "./pages/home";
import Doctors from "./pages/Doctors";
import Login from "./pages/SignUp";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UserTypeSelection from "./pages/UserTypeSelection";
import QuestionsPage from "./pages/QuestionsPage";
import SignIn from "./pages/SignIn";
import Booking from "./pages/Booking";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardHome from "./pages/admin/Dashboard";
import AdminAppointments from "./pages/admin/Appointments";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminDoctor from "./pages/admin/AdminDoctors"; // your renamed file

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

const App = () => {
  return (
    <Routes>
      {/* PUBLIC / USER ROUTES */}
      <Route
        path="/*"
        element={
          <div className="mx-4 sm:mx-[2%]">
            <Navbar />
            <div className="pt-24">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:speciality" element={<Doctors />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/my-profile/:id" element={<MyProfile />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
                <Route path="/appointment/:docId" element={<Appointment />} />
                <Route path="/step1" element={<UserTypeSelection />} />
                <Route path="/patient/questions" element={<QuestionsPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/booking" element={<Booking />} />
              </Routes>
            </div>
            <Footer />
          </div>
        }
      />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminDashboard />}>
        <Route path="dashboard" element={<AdminDashboardHome />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="doctors" element={<AdminDoctor />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>


       {/* ADMIN ROUTES */}
      <Route path="/doctor-panel/:id" element={<DoctorDashboard />}>
  <Route path="profile" element={<DoctorProfile />} />
  <Route path="appointments" element={<DoctorAppointments />} />
</Route>
    </Routes>
  );
};

export default App;
