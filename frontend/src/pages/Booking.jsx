import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get logged-in user from localStorage
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedUser) {
      alert("⚠️ You must login first!");
      navigate("/signin");
      return;
    }
    setUser(loggedUser);
    setEmail(loggedUser.email || "");
    setMobile(loggedUser.mobile || "");
  }, [navigate]);

  if (!bookingData) {
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        ❌ No booking information. Please go back and select an appointment.
      </div>
    );
  }

  const { doctor, time, date } = bookingData;

  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!user) return;

    if (!paymentMethod) {
      alert("⚠️ Please select a payment method.");
      return;
    }

    if (paymentMethod === "receipt" && !receiptFile) {
      alert("⚠️ Please upload your payment receipt.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("user_id", user.user_id);
      formData.append("user_email", email);
      formData.append("user_mobile", mobile);
      formData.append("doctor_firstname", doctor.doctor_firstname);
      formData.append("doctor_lastname", doctor.doctor_lastname);
      formData.append("doctor_specialty", doctor.doctor_specialty);
      formData.append("booking_date", date);
      formData.append("booking_time", time);
      formData.append("booking_fees", doctor.doctor_fees || 2000);

      // 👇 always set default booking status
      formData.append("booking_status", "Pending");

      if (receiptFile) formData.append("booking_receipt", receiptFile);

      await axios.post("http://localhost:4000/api/bookings/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Booking successful!");
      navigate("/my-appointments"); // redirect to appointments page
    } catch (err) {
      console.error("Booking error:", err);
      alert("❌ Booking failed. Try again.");
    } finally {
      setLoading(false);
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
      <form onSubmit={handleConfirm} className="space-y-5">
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
                value="receipt"
                checked={paymentMethod === "receipt"}
                onChange={() => setPaymentMethod("receipt")}
              />
              Upload Receipt
            </label>
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

        {/* Receipt Upload */}
        {paymentMethod === "receipt" && (
          <div>
            <label className="block font-medium mb-1">
              Upload Payment Receipt <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setReceiptFile(e.target.files[0])}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
};

export default Booking;
