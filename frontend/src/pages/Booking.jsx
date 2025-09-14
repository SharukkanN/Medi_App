import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../services/BookingService";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Get logged-in user from localStorage
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedUser) {
      alert("⚠️ You must login first!");
      navigate("/signin");
      return;
    }
    setEmail(loggedUser.email || "");
    setMobile(loggedUser.mobile || "");
    setUserId(loggedUser.user_id || "");
  }, [navigate]);

  if (!bookingData) {
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        ❌ No booking information. Please go back and select an appointment.
      </div>
    );
  }

  const { doctor, time, date } = bookingData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    const bookingBody = {
      user_id: userId,
      user_email: email,
      user_mobile: mobile,
      doctor_firstname: doctor.doctor_firstname,
      doctor_lastname: doctor.doctor_lastname,
      doctor_specialty: doctor.doctor_specialty,
      booking_date: date,
      booking_time: time + ":00",
      booking_fees: parseInt(doctor.doctor_fees) || 0,
      booking_receipt: null,
      booking_prescription: null,
      booking_user_doc: null,
      booking_status: "Pending"
    };
    try {
      await createBooking(bookingBody);
      alert("Booking successful!");
      navigate("/my-appointments");
    } catch (error) {
      alert("Booking failed: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md border mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Confirm Your Booking
      </h2>

      {/* Doctor Info */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
        <p className="font-semibold text-lg">
          Dr. {doctor.doctor_firstname} {doctor.doctor_lastname}
        </p>
        <p className="text-gray-600">{doctor.doctor_specialty}</p>
        <p className="mt-2">📅 {date}</p>
        <p>⏰ {time}</p>
        <p className="mt-2 text-primary font-semibold">
          💰 Fee: Rs. {doctor.doctor_fees || "N/A"}
        </p>
      </div>

      {/* Booking Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter a valid email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Mobile Number (optional)
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter mobile number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block font-medium mb-2">
            Select Payment Method <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              Card Payment
            </label>
          </div>
        </div>



        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-full font-medium hover:opacity-90 transition"
        >
          Book Now
        </button>
      </form>
    </div>
  );
};

export default Booking;
