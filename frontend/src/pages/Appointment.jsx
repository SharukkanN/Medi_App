import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Appointment = () => {
  const { docId } = useParams();
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]); // Array of arrays per date
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const navigate = useNavigate();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [isSignedIn, setIsSignedIn] = useState(true); // For testing

  // Fetch doctor info
  const fetchDocInfo = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/doctor/${docId}`);
      const data = await res.json();
      setDocInfo(data);
    } catch (error) {
      console.error("Error fetching doctor:", error);
    }
  };

  // Prepare slots based on database values
  const prepareSlots = () => {
    if (!docInfo?.doctor_available_time || !docInfo?.doctor_available_date) return;

    const availableTimes = docInfo.doctor_available_time.split(","); // ["09:00 AM - 02:00 PM"]
    const availableDays = docInfo.doctor_available_date.split(","); // ["Mon","Tue"]

    const upcomingSlots = [];

    // Map next 14 days
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() + i);
      const dayName = daysOfWeek[currentDate.getDay()];

      if (!availableDays.includes(dayName)) continue;

      // For each available day, store the times as-is
      const daySlots = availableTimes.map((time) => ({
        datetime: new Date(currentDate),
        time: time.trim(),
      }));

      upcomingSlots.push(daySlots);
    }

    setDocSlots(upcomingSlots);
  };

  useEffect(() => {
    fetchDocInfo();
  }, [docId]);

  useEffect(() => {
    if (docInfo) prepareSlots();
  }, [docInfo]);

  const handleBook = () => {
    if (!isSignedIn) {
      navigate("/signin");
      return;
    }

    navigate("/booking", {
      state: {
        doctor: docInfo,
        time: slotTime,
        date: docSlots[slotIndex][0].datetime.toDateString(),
      },
    });
  };

  return (
    docInfo && (
      <div className="p-6 max-w-6xl mx-auto">
        {/* Doctor Profile */}
        <div className="flex flex-col sm:flex-row gap-6 bg-white rounded-xl shadow-md p-6 border">
          <div className="flex-shrink-0">
            <img
              className="w-64 h-64 object-cover rounded-2xl border shadow-sm"
              src={`http://localhost:4000/uploads/${docInfo.doctor_image}`}
              alt={`Dr. ${docInfo.doctor_firstname}`}
            />
          </div>

          <div className="flex-1">
            <h2 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              Dr. {docInfo.doctor_firstname} {docInfo.doctor_lastname}
              <img className="w-6" src={assets.verified_icon} alt="verified" />
            </h2>

            <div className="flex items-center gap-2 text-sm mt-2 text-gray-600">
              <p className="text-lg font-medium">{docInfo.doctor_specialty}</p>
              <span className="py-1 px-3 bg-blue-100 text-blue-600 rounded-full text-xs">
                {docInfo.doctor_experience} yrs experience
              </span>
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">{docInfo.doctor_bio}</p>

            <p className="mt-6 text-gray-800 font-semibold">
              Appointment Fee:{" "}
              <span className="text-primary text-xl">
                Rs. {docInfo.doctor_fees || 2000}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="mt-10 bg-white shadow-md rounded-xl p-6 border">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Slots</h3>

          {/* Date Selection */}
          <div className="flex gap-3 overflow-x-auto pb-3">
            {docSlots.length > 0 &&
              docSlots.map((daySlots, index) => (
                <div
                  key={index}
                  onClick={() => setSlotIndex(index)}
                  className={`text-center py-4 px-3 min-w-20 rounded-lg cursor-pointer transition ${
                    slotIndex === index
                      ? "bg-primary text-white shadow-md"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-bold">
                    {daysOfWeek[daySlots[0].datetime.getDay()]}
                  </p>
                  <p>{daySlots[0].datetime.getDate()}</p>
                </div>
              ))}
          </div>

          {/* Time Slots */}
          <div className="flex flex-wrap gap-3 mt-6">
            {docSlots[slotIndex] &&
              docSlots[slotIndex].map((slot, i) => (
                <div
                  key={i}
                  onClick={() => setSlotTime(slot.time)}
                  className={`px-5 py-3 border rounded-lg cursor-pointer text-sm transition ${
                    slotTime === slot.time
                      ? "bg-primary text-white shadow-md"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {slot.time}
                </div>
              ))}
          </div>

          {!isSignedIn && (
            <p className="mt-6 text-center text-red-500 font-medium animate-pulse">
              ⚠️ Please sign in first to book an appointment
            </p>
          )}

          <button
            onClick={handleBook}
            className="bg-primary text-white text-sm font-medium px-10 py-3 rounded-full mt-6 hover:opacity-90 transition disabled:opacity-50"
            disabled={!slotTime}
          >
            Book Appointment
          </button>
        </div>
      </div>
    )
  );
};

export default Appointment;
