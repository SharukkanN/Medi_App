// src/pages/MyAppointments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState({}); // Store multiple files per booking

  // Fetch appointments for logged-in user
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        if (!loggedUser) {
          alert("⚠️ Please login to view appointments.");
          return;
        }

        const res = await axios.get(
          `http://localhost:4000/api/bookings/user/${loggedUser.user_id}`
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Handle file selection for multiple files
  const handleFileChange = (booking_id, e) => {
    setFiles((prev) => ({
      ...prev,
      [booking_id]: Array.from(e.target.files),
    }));
  };

  // Handle file upload for multiple files (user docs only)
  const handleUpload = async (booking_id) => {
    if (!files[booking_id] || files[booking_id].length === 0) {
      alert("Please select at least one file to upload!");
      return;
    }

    const formData = new FormData();
    files[booking_id].forEach((file) => formData.append("booking_user_doc", file));

    try {
      await axios.put(
        `http://localhost:4000/api/bookings/update/${booking_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("✅ Files uploaded successfully!");
      setFiles((prev) => ({ ...prev, [booking_id]: [] }));

      // Refresh appointments
      const loggedUser = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(
        `http://localhost:4000/api/bookings/user/${loggedUser.user_id}`
      );
      setAppointments(res.data);
    } catch (err) {
      console.error("Error uploading files:", err);
      alert("❌ Failed to upload files.");
    }
  };

  // Handle download of files (correct folder based on type)
  const handleDownload = (filename, type) => {
    if (!filename) {
      alert("❌ No file available!");
      return;
    }

    let folder = "";
    if (type === "prescription") folder = "Doctor";
    else if (type === "user_doc") folder = "User";

    const link = document.createElement("a");
    link.href = `http://localhost:4000/Upload/Booking/${folder}/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status button
  const getStatusButton = (item) => {
    const baseClasses =
      "px-4 py-2 text-sm font-medium rounded-full text-center w-full sm:w-auto";

    switch (item.booking_status) {
      case "Pending":
        return (
          <button className={`${baseClasses} bg-yellow-100 text-yellow-800`} disabled>
            ⏳ Pending
          </button>
        );
      case "Processing":
        return (
          <button className={`${baseClasses} bg-blue-100 text-blue-800`} disabled>
            🔄 Processing
          </button>
        );
      case "Confirmed":
        return (
          <button className={`${baseClasses} bg-purple-100 text-purple-800`} disabled>
            ✅ Confirmed
          </button>
        );
      case "Link":
        return (
          <a
            href={item.booking_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseClasses} bg-green-100 text-green-800 hover:bg-green-200 transition block text-center`}
          >
            🚀 Join Consultation
          </a>
        );
      default:
        return (
          <button className={`${baseClasses} bg-gray-100 text-gray-700`} disabled>
            ℹ️ {item.booking_status}
          </button>
        );
    }
  };

  if (loading) return <p className="text-center py-10">⏳ Loading appointments...</p>;

  if (appointments.length === 0) {
    return <div className="p-6 text-center text-gray-500">You have no booked appointments yet.</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b text-lg">
        My Appointments
      </p>
      <div className="space-y-4 mt-4">
        {appointments.map((item) => {
          // Split multiple filenames
          const userDocs = item.booking_user_doc ? item.booking_user_doc.split(",") : [];
          const prescriptions = item.booking_prescription ? item.booking_prescription.split(",") : [];

          return (
            <div
              key={item.booking_id}
              className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 p-4 border rounded-lg shadow-sm items-center"
            >
              {/* Doctor Image */}
              <div className="flex justify-center sm:justify-start">
                <img
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg bg-indigo-50"
                  src={item.doctor_image || "/default-doctor.png"}
                  alt="Doctor"
                />
              </div>

              {/* Appointment Info */}
              <div className="text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold text-base">
                  Dr. {item.doctor_firstname} {item.doctor_lastname}
                </p>
                <p className="italic text-indigo-600">{item.doctor_specialty}</p>

                <p
                  className={`mt-1 font-medium ${
                    item.booking_status === "Link" ? "text-red-600 font-bold" : "text-neutral-700"
                  }`}
                >
                  {item.booking_status === "Link"
                    ? `🚨 Your Consultation: ${item.booking_date} at ${item.booking_time} — Click Join Below`
                    : `Your Consultation: ${item.booking_date} at ${item.booking_time}`}
                </p>

                <p className="mt-1 text-primary font-medium">
                  💰 Fee: Rs. {item.booking_fees}
                </p>

                {/* Upload & Download */}
                {item.booking_status === "Link" && (
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {/* Upload Multiple User Docs */}
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileChange(item.booking_id, e)}
                      className="border p-1 rounded"
                    />
                    <button
                      onClick={() => handleUpload(item.booking_id)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                    >
                      Upload Documents
                    </button>

                    {/* Download Prescriptions */}
                    {prescriptions.map((filename, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDownload(filename, "prescription")}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                      >
                        Download Prescription {idx + 1}
                      </button>
                    ))}

                    {/* Download User Docs */}
                    {userDocs.map((filename, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDownload(filename, "user_doc")}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Download Document {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Button */}
              <div className="flex flex-col gap-2 items-center sm:items-end">
                {getStatusButton(item)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;
