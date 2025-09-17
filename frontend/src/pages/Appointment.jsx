import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  Stethoscope,
  Video,
  Star,
  Clock,
  Hospital,
  CheckCircle,
  Info,
} from "lucide-react";
import { getDoctorDetailsById } from "../services/DoctorService";

const Appointment = () => {
  const { docId } = useParams();
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(true); // mock login state
  const navigate = useNavigate();

  const daysOfWeek = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);
  const monthNames = useMemo(() => [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ], []);

  // Fetch doctor info
  const fetchDocInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDoctorDetailsById(docId);
      setDocInfo(data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      setError("Failed to load doctor information");
    } finally {
      setIsLoading(false);
    }
  }, [docId]);

  // Prepare slots
  const prepareSlots = useCallback(() => {
    if (!docInfo?.doctor_available_time || !docInfo?.doctor_available_date) return;

    const availableTimes = docInfo.doctor_available_time.split(",");
    const availableDays = docInfo.doctor_available_date.split(",");

    const upcomingSlots = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() + i);
      const dayName = daysOfWeek[currentDate.getDay()];

      if (!availableDays.includes(dayName)) continue;

      const daySlots = availableTimes.map((time) => ({
        datetime: new Date(currentDate),
        time: time.trim(),
      }));

      upcomingSlots.push(daySlots);
    }

    setDocSlots(upcomingSlots);
  }, [docInfo, daysOfWeek]);

  useEffect(() => {
    fetchDocInfo();
  }, [fetchDocInfo]);

  useEffect(() => {
    if (docInfo) prepareSlots();
  }, [docInfo, prepareSlots]);

  const handleBook = () => {
    if (!isSignedIn) {
      navigate("/signin");
      return;
    }
    if (!slotTime) {
      alert("Please select a time slot");
      return;
    }
    navigate("/booking", {
      state: {
        doctor: docInfo,
        time: slotTime,
        date: docSlots[slotIndex][0].datetime.toDateString(),
        appointmentType: "physical",
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="font-semibold text-lg mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    docInfo && (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to Doctors
            </button>
          </nav>

          {/* Doctor Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row gap-8 p-8">
              {/* Image */}
              <img
                src={`${import.meta.env.VITE_CLOUDINARY_URL}/${docInfo.doctor_image}`}
                alt={docInfo.doctor_firstname}
                className="w-48 h-48 lg:w-64 lg:h-64 object-cover rounded-2xl border"
              />
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  Dr. {docInfo.doctor_firstname} {docInfo.doctor_lastname}
                  <CheckCircle className="text-green-600 w-5 h-5" />
                </h1>
                <p className="text-gray-600 mt-1">{docInfo.doctor_specialty}</p>
                <div className="flex gap-6 mt-4 text-gray-700">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-4 h-4" />
                    {docInfo.doctor_experience} yrs
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" /> 4.8/5
                  </span>
                  <span className="flex items-center gap-1">
                    <Hospital className="w-4 h-4" /> 500+ Patients
                  </span>
                </div>
                <hr className="my-4" />
                <p className="text-gray-700 leading-relaxed">
                  {docInfo.doctor_bio ||
                    "Experienced medical professional dedicated to quality care."}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Book Your Appointment
            </h2>

            {/* Dates */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Available Dates
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {docSlots.map((daySlots, index) => {
                  const date = daySlots[0].datetime;
                  const isSelected = slotIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setSlotIndex(index);
                        setSlotTime("");
                      }}
                      className={`p-4 rounded-lg text-center cursor-pointer border transition ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                      }`}
                    >
                      <div className="text-sm">
                        {daysOfWeek[date.getDay()]}
                      </div>
                      <div className="text-xl font-bold">{date.getDate()}</div>
                      <div className="text-xs">{monthNames[date.getMonth()]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            {docSlots[slotIndex] && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">Available Time</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {docSlots[slotIndex].map((slot, i) => {
                    const isSelected = slotTime === slot.time;
                    return (
                      <button
                        key={i}
                        onClick={() => setSlotTime(slot.time)}
                        className={`px-4 py-2 rounded-lg border text-sm flex items-center justify-center gap-2 transition ${
                          isSelected
                            ? "bg-green-600 text-white border-green-600"
                            : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sign In Warning */}
            {!isSignedIn && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Please sign in to book an appointment.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleBook}
              disabled={!slotTime}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition ${
                !slotTime
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {slotTime
                ? `Book Appointment - ${slotTime}`
                : "Select Date & Time"}
            </button>
            <div className="text-center sm:text-right">
              <div className="text-sm text-gray-600">Consultation Fee</div>
              <div className="text-xl font-bold text-green-600">
                Rs. {docInfo.doctor_fees}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Appointment;
