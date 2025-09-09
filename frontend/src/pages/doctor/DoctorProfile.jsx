// src/pages/doctor/DoctorProfile.jsx
import React, { useEffect, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      const parsedDoctor = JSON.parse(storedDoctor);
      setDoctor({
        ...parsedDoctor,
        doctor_available_date: parsedDoctor.doctor_available_date
          ? parsedDoctor.doctor_available_date.split(",")
          : [],
      });
    }

    const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/bookings/all");
        const data = await res.json();
        const doctorAppointments = data.filter(
          (appt) =>
            appt.doctor_firstname === JSON.parse(storedDoctor).doctor_firstname &&
            appt.doctor_lastname === JSON.parse(storedDoctor).doctor_lastname
        );
        setAppointments(doctorAppointments);

        // Calculate earnings (only Link bookings)
        const earnings = doctorAppointments
          .filter((appt) => appt.booking_status === "Link")
          .reduce((sum, appt) => sum + Number(appt.booking_fees || 0), 0);
        setTotalEarnings(earnings);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    if (storedDoctor) fetchAppointments();
  }, []);

  if (!doctor) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Profile Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border-t-8 border-[#5F6FFF]">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <img
            src={doctor.doctor_image || "https://via.placeholder.com/150"}
            alt={`${doctor.doctor_firstname} ${doctor.doctor_lastname}`}
            className="w-32 h-32 rounded-full border-4 border-[#5F6FFF] shadow"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#5F6FFF]">
              Dr. {doctor.doctor_firstname} {doctor.doctor_lastname}
            </h2>
            <p className="text-gray-600 text-lg">{doctor.doctor_specialty}</p>
            <p className="text-gray-600 mt-1">
              Experience: {doctor.doctor_experience || "N/A"} years
            </p>
          </div>
        </div>

        {/* Bio */}
        {doctor.doctor_bio && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-1 text-[#5F6FFF]">About</h3>
            <p className="text-gray-700">{doctor.doctor_bio}</p>
          </div>
        )}

        {/* Contact & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-semibold text-[#5F6FFF]">Email</h4>
            <p className="text-gray-700">{doctor.doctor_email}</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#5F6FFF]">Mobile</h4>
            <p className="text-gray-700">{doctor.doctor_mobile}</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#5F6FFF]">Consultation Fee</h4>
            <p className="text-gray-700">LKR {doctor.doctor_fees || "N/A"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#5F6FFF]">Available Time</h4>
            <p className="text-gray-700">{doctor.doctor_available_time || "N/A"}</p>
          </div>
        </div>

        {/* Available Days */}
        <div className="mb-6">
          <h4 className="font-semibold text-[#5F6FFF] mb-2">Available Days</h4>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <span
                key={day}
                className={`px-3 py-1 border rounded ${
                  doctor.doctor_available_date.includes(day)
                    ? "bg-[#5F6FFF] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#5F6FFF] text-white rounded-lg p-4 flex flex-col items-center justify-center shadow">
            <p className="text-xl font-bold">{appointments.length}</p>
            <p className="text-sm mt-1">Total Appointments</p>
          </div>
          <div className="bg-green-500 text-white rounded-lg p-4 flex flex-col items-center justify-center shadow">
            <p className="text-xl font-bold">LKR {totalEarnings}</p>
            <p className="text-sm mt-1">Total Earnings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
