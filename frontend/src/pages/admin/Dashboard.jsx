// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaUserMd, FaUsers, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [counts, setCounts] = useState({ doctors: 0, users: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const [docRes, userRes, appRes] = await Promise.all([
          axios.get("http://localhost:4000/api/doctor/count/all"),
          axios.get("http://localhost:4000/api/users/count/all"),
          axios.get("http://localhost:4000/api/bookings/count/all"),
        ]);

        setCounts({
          doctors: docRes.data.count || 0,
          users: userRes.data.count || 0,
          appointments: appRes.data.count || 0,
        });
      } catch (err) {
        console.error("Error fetching counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const pieData = {
    labels: ["Doctors", "Users", "Appointments"],
    datasets: [
      {
        label: "Distribution",
        data: [counts.doctors, counts.users, counts.appointments],
        backgroundColor: ["#5F6FFF", "#FF6F61", "#FFC107"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FEEDD6]">
        <p className="text-xl font-semibold text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#FEEDD6]">
      <h1 className="text-4xl font-extrabold mb-8 text-[#5F6FFF]">Admin Dashboard</h1>

      {/* Counts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Doctors Card */}
        <div className="bg-gradient-to-r from-[#5F6FFF] to-[#818CFF] text-white rounded-3xl shadow-xl p-6 flex items-center gap-4 transform hover:scale-105 transition-transform cursor-pointer">
          <FaUserMd className="text-4xl" />
          <div>
            <h2 className="text-lg font-semibold">Doctors</h2>
            <p className="text-3xl font-bold">{counts.doctors}</p>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-gradient-to-r from-[#FF6F61] to-[#FF8C71] text-white rounded-3xl shadow-xl p-6 flex items-center gap-4 transform hover:scale-105 transition-transform cursor-pointer">
          <FaUsers className="text-4xl" />
          <div>
            <h2 className="text-lg font-semibold">Users</h2>
            <p className="text-3xl font-bold">{counts.users}</p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-gradient-to-r from-[#FFC107] to-[#FFD54F] text-white rounded-3xl shadow-xl p-6 flex items-center gap-4 transform hover:scale-105 transition-transform cursor-pointer">
          <FaCalendarAlt className="text-4xl" />
          <div>
            <h2 className="text-lg font-semibold">Appointments</h2>
            <p className="text-3xl font-bold">{counts.appointments}</p>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-3xl shadow-xl p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">
          Overall Distribution
        </h2>
        <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
      </div>
    </div>
  );
};

export default Dashboard;
