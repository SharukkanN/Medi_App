// src/pages/doctor/DoctorAppointments.jsx
import React, { useEffect, useState } from "react";
import { uploadImage } from "../../api/ApiManager";
import { addPrescription } from "../../services/BookingService";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState({});
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctor = JSON.parse(localStorage.getItem("doctor"));
        if (!doctor) return;

        const res = await fetch(`http://localhost:4000/api/bookings/all`);
        const data = await res.json();

        const doctorAppointments = data.filter(
          (appt) =>
            appt.doctor_firstname === doctor.doctor_firstname &&
            appt.doctor_lastname === doctor.doctor_lastname
        ).map(appt => ({
          ...appt,
          prescription_url: appt.booking_prescription ? (() => {
            try {
              const parsed = JSON.parse(appt.booking_prescription);
              return parsed && parsed.length > 0 ? `https://res.cloudinary.com/dlpcwx94i/image/upload/v1758033628/${parsed[0]}` : null;
            } catch {
              return null;
            }
          })() : null
        }));

        setAppointments(doctorAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    fetchAppointments();
  }, []);

  // Calculate summary
  const totalEarnings = appointments.reduce(
    (sum, appt) => sum + (Number(appt.booking_fees) || 0),
    0
  );

  const handleDownload = (docUrl) => {
    if (!docUrl) {
      alert("No document available to download.");
      return;
    }
    const link = document.createElement("a");
    link.href = docUrl;
    link.download = ""; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (e, bookingId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [bookingId]: true }));

    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadRes = await uploadImage(formData);
      const publicId = uploadRes.data.publicId;
      const prescriptionUrl = `https://res.cloudinary.com/dlpcwx94i/image/upload/v1758033628/${publicId}`;

      const addRes = await addPrescription(bookingId, [publicId]);

      if (addRes.data.success) {
        alert("Prescription uploaded successfully!");
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.booking_id === bookingId
              ? { ...appt, booking_status: "Confirmed", prescription_url: prescriptionUrl }
              : appt
          )
        );
      } else {
        alert(addRes.data.message || "Upload failed!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    } finally {
      setUploading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const totalPages = Math.ceil(appointments.length / rowsPerPage);
  const currentData = appointments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-[#5F6FFF] text-center">
        My Appointments
      </h1>

      {/* Summary Card */}
      {/* <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex-1 bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-default">
          <h3 className="text-gray-500 font-medium">Total Appointments</h3>
          <p className="text-2xl font-bold text-[#5F6FFF]">{appointments.length}</p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-default">
          <h3 className="text-gray-500 font-medium">Total Earnings</h3>
          <p className="text-2xl font-bold text-green-500">LKR {totalEarnings}</p>
        </div>
      </div> */}

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 text-lg">
          No appointments found.
        </p>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-[#5F6FFF] text-white text-left text-base">
                <th className="px-6 py-3">No.</th>
                <th className="px-6 py-3">Booking Date</th>
                <th className="px-6 py-3">Booking Time</th>
                <th className="px-6 py-3">Fees</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">User Doc</th>
                <th className="px-6 py-3 text-center">Prescription</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
              {currentData.map((appt, index) => {
                const isLinkStatus = appt.booking_status === "Link";

                return (
                  <tr
                    key={appt.booking_id}
                    className="border-b hover:bg-gray-50 transition-all text-gray-700"
                  >
                    <td className="px-6 py-4">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">{appt.booking_date}</td>
                    <td className="px-6 py-4">{appt.booking_time}</td>
                    <td className="px-6 py-4">{appt.booking_fees}</td>
                    <td className="px-6 py-4">
                      {isLinkStatus && appt.booking_link ? (
                        <a
                          href={appt.booking_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          {appt.booking_status}
                        </a>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-white font-medium text-xs ${
                            appt.booking_status === "Confirmed"
                              ? "bg-green-500"
                              : appt.booking_status === "Pending"
                              ? "bg-yellow-500"
                              : appt.booking_status === "Processing"
                              ? "bg-orange-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {appt.booking_status}
                        </span>
                      )}
                    </td>

                    {/* Download User Doc */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(appt.user_doc_url)}
                        className={`px-3 py-1 rounded ${
                          isLinkStatus && appt.user_doc_url
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                        disabled={!(isLinkStatus && appt.user_doc_url)}
                      >
                        Download
                      </button>
                    </td>

                    {/* Upload Prescription */}
                    <td className="px-6 py-4 text-center">
                      {appt.prescription_url ? (
                        <a
                          href={appt.prescription_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          View Prescription
                        </a>
                      ) : isLinkStatus ? (
                        <label className="flex items-center justify-center px-3 py-1 border rounded bg-blue-500 text-white cursor-pointer hover:bg-blue-600">
                          {uploading[appt.booking_id] ? "Uploading..." : "Choose File"}
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, appt.booking_id)}
                            className="hidden"
                            disabled={uploading[appt.booking_id]}
                          />
                        </label>
                      ) : (
                        <span className="text-gray-500">Not available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between mt-6 items-center">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Back
            </button>
            <span className="text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
