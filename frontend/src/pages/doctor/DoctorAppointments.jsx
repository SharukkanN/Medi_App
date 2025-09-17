// src/pages/doctor/DoctorAppointments.jsx
import React, { useEffect, useState } from "react";
import { uploadImage } from "../../api/ApiManager";
import { addPrescription } from "../../services/BookingService";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState({});
  const [documentModal, setDocumentModal] = useState({ isOpen: false, docs: [], title: '' });
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
              return parsed && parsed.length > 0 ? `${import.meta.env.VITE_CLOUDINARY_URL}/${parsed[0]}` : null;
            } catch {
              return null;
            }
          })() : null,
          // Parse user documents
          user_documents: appt.booking_user_doc ? (() => {
            try {
              const parsed = JSON.parse(appt.booking_user_doc);
              return Array.isArray(parsed) ? parsed.map(docId => 
                `${import.meta.env.VITE_CLOUDINARY_URL}/${docId}`
              ) : [];
            } catch {
              return [];
            }
          })() : []
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

  // Handle document viewing/downloading
  const handleViewDocuments = (appt) => {
    if (!appt.user_documents || appt.user_documents.length === 0) {
      alert("No documents available for this appointment.");
      return;
    }

    setDocumentModal({
      isOpen: true,
      docs: appt.user_documents,
      title: `Patient Documents - ${appt.booking_date} ${appt.booking_time}`
    });
  };

  // Download single document
  const downloadDocument = async (docUrl, index) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(docUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `patient_document_${index + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  // Download all documents
  const downloadAllDocuments = (docs) => {
    docs.forEach((docUrl, index) => {
      setTimeout(() => downloadDocument(docUrl, index), index * 500);
    });
  };

  // Close modal
  const closeModal = () => {
    setDocumentModal({ isOpen: false, docs: [], title: '' });
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
      const prescriptionUrl = `${import.meta.env.VITE_CLOUDINARY_URL}/${publicId}`;

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
                <th className="px-6 py-3 text-center">Patient Documents</th>
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
                const hasDocuments = appt.user_documents && appt.user_documents.length > 0;
                
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
                    {/* View Patient Documents */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDocuments(appt)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            hasDocuments
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                          disabled={!hasDocuments}
                        >
                          {hasDocuments ? `View Docs (${appt.user_documents.length})` : "No Documents"}
                        </button>
                      </div>
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

      {/* Document Modal */}
      {documentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#5F6FFF] text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{documentModal.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadAllDocuments(documentModal.docs)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Download All
                </button>
                <button
                  onClick={closeModal}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documentModal.docs.map((docUrl, index) => (
                  <div key={index} className="border rounded-xl overflow-hidden shadow-md">
                    <div className="bg-gray-50 p-3 flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        Document {index + 1}
                      </span>
                      <button
                        onClick={() => downloadDocument(docUrl, index)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Download
                      </button>
                    </div>
                    <div className="p-4">
                      <img
                        src={docUrl}
                        alt={`Patient Document ${index + 1}`}
                        className="w-full h-auto max-h-96 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(docUrl, '_blank')}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTcuNzkwOSA3MCA5NiA3MS43OTA5IDk2IDc0Qzk2IDc2LjIwOTEgOTcuNzkwOSA3OCA5NiA3OEMxMDIuMjA5IDc4IDEwNCA3Ni4yMDkxIDEwNCA3NEMxMDQgNzEuNzkwOSAxMDIuMjA5IDcwIDEwMCA3MFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHA+RG9jdW1lbnQgbm90IGZvdW5kPC9wPgo8L3N2Zz4K';
                          e.target.alt = 'Document not found';
                        }}
                      />
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        Click image to open in new tab
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
