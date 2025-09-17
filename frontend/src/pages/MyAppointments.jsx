// src/pages/MyAppointments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { uploadImage } from "../api/ApiManager";
import { addUserDocuments } from "../services/BookingService";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});

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

  // Generate file previews
  const generatePreviews = (booking_id, allFiles) => {
    // Clear existing previews for this booking
    setFilePreviews(prev => ({
      ...prev,
      [booking_id]: {}
    }));

    allFiles.forEach((file, index) => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isDocument = file.type.includes('document') || 
                        file.type.includes('text') || 
                        file.type.includes('spreadsheet') ||
                        file.name.toLowerCase().match(/\.(doc|docx|xls|xlsx|txt|csv)$/);

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews(prev => ({
            ...prev,
            [booking_id]: {
              ...prev[booking_id],
              [index]: {
                type: 'image',
                url: e.target.result,
                name: file.name,
                size: file.size,
                file: file
              }
            }
          }));
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, create a placeholder preview
        setFilePreviews(prev => ({
          ...prev,
          [booking_id]: {
            ...prev[booking_id],
            [index]: {
              type: isPDF ? 'pdf' : isDocument ? 'document' : 'other',
              url: null,
              name: file.name,
              size: file.size,
              file: file
            }
          }
        }));
      }
    });
  };

  // Handle file selection for multiple files
  const handleFileChange = (booking_id, e) => {
    const newFiles = Array.from(e.target.files);
    const currentFiles = files[booking_id] || [];
    const allFiles = [...currentFiles, ...newFiles];
    
    setFiles((prev) => ({
      ...prev,
      [booking_id]: allFiles,
    }));

    // Generate previews for all files
    generatePreviews(booking_id, allFiles);
  };

  // Remove individual file from selection
  const removeFile = (booking_id, fileIndex) => {
    setFiles(prev => ({
      ...prev,
      [booking_id]: prev[booking_id].filter((_, index) => index !== fileIndex)
    }));

    setFilePreviews(prev => {
      const updated = { ...prev };
      if (updated[booking_id]) {
        delete updated[booking_id][fileIndex];
        // Reindex remaining files
        const remainingPreviews = {};
        Object.entries(updated[booking_id]).forEach(([key, value], newIndex) => {
          if (parseInt(key) > fileIndex) {
            remainingPreviews[newIndex] = value;
          } else if (parseInt(key) < fileIndex) {
            remainingPreviews[key] = value;
          }
        });
        updated[booking_id] = remainingPreviews;
      }
      return updated;
    });
  };

  // Handle file upload for multiple files (user docs only)
  const handleUpload = async (booking_id) => {
    if (!files[booking_id] || files[booking_id].length === 0) {
      alert("Please select at least one file to upload!");
      return;
    }

    try {
      const publicIds = [];
      const selectedFiles = files[booking_id];

      // Upload each file to get publicId
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("image", file);

        const uploadResponse = await uploadImage(formData);
        if (uploadResponse.data && uploadResponse.data.publicId) {
          publicIds.push(uploadResponse.data.publicId);
        } else {
          throw new Error("Failed to get publicId from upload response");
        }
      }

      // Add user documents using the collected publicIds
      if (publicIds.length > 0) {
        await addUserDocuments(booking_id, publicIds);
        alert("✅ Files uploaded successfully!");
        
        // Clear files and previews
        setFiles((prev) => ({ ...prev, [booking_id]: [] }));
        setFilePreviews((prev) => ({ ...prev, [booking_id]: {} }));

        // Refresh appointments
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        const res = await axios.get(
          `http://localhost:4000/api/bookings/user/${loggedUser.user_id}`
        );
        setAppointments(res.data);
      } else {
        throw new Error("No files were uploaded successfully");
      }
    } catch (err) {
      console.error("Error uploading files:", err);
      alert("❌ Failed to upload files. Please try again.");
    }
  };

  // Handle view of files using Cloudinary
  const handleDownload = (filename) => {
    if (!filename) {
      alert("❌ No file available!");
      return;
    }

    const url = `https://res.cloudinary.com/dlpcwx94i/image/upload/v1757946102/${filename}`;
    window.open(url, '_blank');
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'document': return '📝';
      case 'image': return '🖼️';
      default: return '📎';
    }
  };

  // File Preview Component
  const FilePreview = ({ booking_id }) => {
    const previews = filePreviews[booking_id] || {};
    const selectedFiles = files[booking_id] || [];

    if (selectedFiles.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          👁️ File Preview ({selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''})
        </h5>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedFiles.map((file, index) => {
            const preview = previews[index];
            
            return (
              <div key={index} className="relative bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow duration-200">
                {/* Remove Button */}
                <button
                  onClick={() => removeFile(booking_id, index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 z-10"
                >
                  ✕
                </button>

                {/* File Preview Content */}
                <div className="flex flex-col items-center">
                  {preview?.type === 'image' && preview?.url ? (
                    <div className="w-full h-24 mb-2 overflow-hidden rounded-md">
                      <img 
                        src={preview.url} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 mb-2 flex items-center justify-center bg-gray-100 rounded-md">
                      <span className="text-3xl">{getFileIcon(preview?.type || 'other')}</span>
                    </div>
                  )}

                  {/* File Info */}
                  <div className="w-full text-center">
                    <p className="text-xs font-medium text-gray-800 truncate mb-1" title={file.name}>
                      {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Document Preview Component for existing prescriptions and user docs
  const DocumentPreview = ({ documents, title, icon }) => {
    if (!documents || documents.length === 0) return null;

    const getDocumentType = (filename) => {
      const extension = filename.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
      if (extension === 'pdf') return 'pdf';
      if (['doc', 'docx'].includes(extension)) return 'document';
      return 'other';
    };

    const getDocumentIcon = (docType) => {
      switch (docType) {
        case 'pdf': return '📄';
        case 'document': return '📝';
        case 'image': return '🖼️';
        default: return '📎';
      }
    };

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          {icon} {title} ({documents.length})
        </h5>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((filename, index) => {
            const docType = getDocumentType(filename);
            const cloudinaryUrl = `https://res.cloudinary.com/dlpcwx94i/image/upload/v1757946102/${filename}`;
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => handleDownload(filename)}
              >
                {/* Document Preview Content */}
                <div className="flex flex-col items-center">
                  {docType === 'image' ? (
                    <div className="w-full h-24 mb-2 overflow-hidden rounded-md">
                      <img 
                        src={cloudinaryUrl} 
                        alt={`Document ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-24 mb-2 hidden items-center justify-center bg-gray-100 rounded-md">
                        <span className="text-3xl">{getDocumentIcon(docType)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 mb-2 flex items-center justify-center bg-gray-100 rounded-md">
                      <span className="text-3xl">{getDocumentIcon(docType)}</span>
                    </div>
                  )}

                  {/* Document Info */}
                  <div className="w-full text-center">
                    <p className="text-xs font-medium text-gray-800 truncate mb-1" title={filename}>
                      {filename.length > 15 ? `${filename.substring(0, 15)}...` : filename}
                    </p>
                    <p className="text-xs text-blue-600 hover:text-blue-800">
                      Click to view
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Status badge component
  const StatusBadge = ({ status, link }) => {
    const statusConfig = {
      Pending: {
        icon: "⏳",
        text: "Pending",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      Processing: {
        icon: "🔄",
        text: "Processing",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
      },
      Confirmed: {
        icon: "✅",
        text: "Confirmed",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
      Link: {
        icon: "🚀",
        text: "Join Now",
        className: "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 hover:shadow-md transition-all duration-200 cursor-pointer",
      },
    };

    const config = statusConfig[status] || {
      icon: "ℹ️",
      text: status,
      className: "bg-gray-50 text-gray-700 border border-gray-200",
    };

    if (status === "Link" && link) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${config.className} no-underline`}
        >
          <span className="text-base">{config.icon}</span>
          {config.text}
        </a>
      );
    }

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${config.className}`}>
        <span className="text-base">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  // File management component
  const FileManager = ({ appointment }) => {
    const userDocs = appointment.booking_user_doc ? JSON.parse(appointment.booking_user_doc) : [];
    const prescriptions = appointment.booking_prescription ? JSON.parse(appointment.booking_prescription) : [];

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          📎 Document Management
        </h4>
        
        {/* Upload Section */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            onChange={(e) => handleFileChange(appointment.booking_id, e)}
            className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => handleUpload(appointment.booking_id)}
            disabled={!files[appointment.booking_id] || files[appointment.booking_id].length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          >
            📤 Upload Documents
          </button>
        </div>

        {/* File Preview Section */}
        <FilePreview booking_id={appointment.booking_id} />

        {/* Document Previews */}
        <DocumentPreview 
          documents={prescriptions} 
          title="Prescriptions" 
          icon="💊" 
        />
        <DocumentPreview 
          documents={userDocs} 
          title="Your Documents" 
          icon="📄" 
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Appointments Yet</h2>
          <p className="text-gray-600 mb-6">You haven't booked any appointments. Start by finding a doctor that suits your needs.</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
            Book Your First Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your healthcare appointments and documents</p>
          <div className="mt-4 h-1 w-20 bg-blue-600 rounded"></div>
        </div>

        {/* Appointments Grid */}
        <div className="space-y-6">
          {appointments.map((appointment) => (
            <div
              key={appointment.booking_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Doctor Image */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={appointment.doctor_image || "/default-doctor.png"}
                        alt={`Dr. ${appointment.doctor_firstname} ${appointment.doctor_lastname}`}
                        className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-xl border-4 border-blue-100"
                      />
                      <div className="absolute -bottom-2 -right-2">
                        <StatusBadge status={appointment.booking_status} link={appointment.booking_link} />
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          Dr. {appointment.doctor_firstname} {appointment.doctor_lastname}
                        </h3>
                        <p className="text-blue-600 font-medium mb-2">{appointment.doctor_specialty}</p>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📅</span>
                            <span className="font-medium">{appointment.booking_date}</span>
                            <span className="text-base">⏰</span>
                            <span className="font-medium">{appointment.booking_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">💰</span>
                            <span className="font-semibold text-green-600">₹{appointment.booking_fees}</span>
                          </div>
                        </div>

                        {appointment.booking_status === "Link" && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 font-medium text-sm flex items-center gap-2">
                              🚨 <span>Your consultation is ready! Click "Join Now" to start your session.</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* File Management - Only show for Link status */}
                    {appointment.booking_status === "Link" && (
                      <FileManager appointment={appointment} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
            <div className="text-sm text-gray-600">Total Appointments</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.booking_status === "Link").length}
            </div>
            <div className="text-sm text-gray-600">Ready to Join</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {appointments.filter(a => ["Pending", "Processing", "Confirmed"].includes(a.booking_status)).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
