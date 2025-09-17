// src/pages/MyAppointments.jsx
import React, { useEffect, useState } from "react";
import { uploadImage } from "../api/ApiManager";
import { addUserDocuments, fetchAppointmentsByUser } from "../services/BookingService";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFiles, setNewFiles] = useState({}); // Only new files selected by user
  const [newFilePreviews, setNewFilePreviews] = useState({});
  const [existingFiles, setExistingFiles] = useState({}); // Existing files from server
  const [filesToRemove, setFilesToRemove] = useState({}); // Track existing files to be removed

  // Fetch appointments for logged-in user
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        if (!loggedUser) {
          alert("⚠️ Please login to view appointments.");
          return;
        }
        const res = await fetchAppointmentsByUser(loggedUser.user_id);
        setAppointments(res.data);
        
        // Initialize existing files for each appointment
        const existingFilesData = {};
        res.data.forEach(appointment => {
          const userDocs = appointment.booking_user_doc ? JSON.parse(appointment.booking_user_doc) : [];
          existingFilesData[appointment.booking_id] = userDocs;
        });
        setExistingFiles(existingFilesData);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Generate file previews for new files only
  const generateNewFilePreviews = (booking_id, allFiles) => {
    setNewFilePreviews(prev => ({
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
          setNewFilePreviews(prev => ({
            ...prev,
            [booking_id]: {
              ...prev[booking_id],
              [index]: {
                type: 'image',
                url: e.target.result,
                name: file.name,
                size: file.size,
                file: file,
                isNew: true
              }
            }
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setNewFilePreviews(prev => ({
          ...prev,
          [booking_id]: {
            ...prev[booking_id],
            [index]: {
              type: isPDF ? 'pdf' : isDocument ? 'document' : 'other',
              url: null,
              name: file.name,
              size: file.size,
              file: file,
              isNew: true
            }
          }
        }));
      }
    });
  };

  // Handle new file selection
  const handleNewFileChange = (booking_id, e) => {
    const selectedFiles = Array.from(e.target.files);
    const currentNewFiles = newFiles[booking_id] || [];
    const allNewFiles = [...currentNewFiles, ...selectedFiles];
    
    setNewFiles((prev) => ({
      ...prev,
      [booking_id]: allNewFiles,
    }));

    generateNewFilePreviews(booking_id, allNewFiles);
  };

  // Remove new file from selection
  const removeNewFile = (booking_id, fileIndex) => {
    setNewFiles(prev => ({
      ...prev,
      [booking_id]: prev[booking_id]?.filter((_, index) => index !== fileIndex) || []
    }));

    setNewFilePreviews(prev => {
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

  // Mark existing file for removal
  const markExistingFileForRemoval = (booking_id, filename) => {
    setFilesToRemove(prev => ({
      ...prev,
      [booking_id]: [...(prev[booking_id] || []), filename]
    }));
  };

  // Restore existing file (unmark for removal)
  const restoreExistingFile = (booking_id, filename) => {
    setFilesToRemove(prev => ({
      ...prev,
      [booking_id]: prev[booking_id]?.filter(f => f !== filename) || []
    }));
  };

  // Check if existing file is marked for removal
  const isMarkedForRemoval = (booking_id, filename) => {
    return filesToRemove[booking_id]?.includes(filename) || false;
  };

  // Handle file upload
  const handleUpload = async (booking_id) => {
    const selectedNewFiles = newFiles[booking_id] || [];
    const existingFilesToKeep = (existingFiles[booking_id] || []).filter(
      filename => !isMarkedForRemoval(booking_id, filename)
    );

    if (selectedNewFiles.length === 0 && existingFilesToKeep.length === (existingFiles[booking_id] || []).length) {
      alert("No changes to save!");
      return;
    }

    try {
      const publicIds = [];

      // Upload new files and get publicIds
      for (const file of selectedNewFiles) {
        const formData = new FormData();
        formData.append("image", file);
        const uploadResponse = await uploadImage(formData);
        if (uploadResponse.data && uploadResponse.data.publicId) {
          publicIds.push(uploadResponse.data.publicId);
        } else {
          throw new Error("Failed to get publicId from upload response");
        }
      }

      // Combine existing files (not marked for removal) with new uploaded files
      const allDocuments = [...existingFilesToKeep, ...publicIds];

      // Update user documents with combined list
      if (allDocuments.length >= 0) {
        await addUserDocuments(booking_id, allDocuments);
        alert("✅ Documents updated successfully!");
        
        // Clear new files and previews
        setNewFiles((prev) => ({ ...prev, [booking_id]: [] }));
        setNewFilePreviews((prev) => ({ ...prev, [booking_id]: {} }));
        setFilesToRemove((prev) => ({ ...prev, [booking_id]: [] }));

        // Update existing files state
        setExistingFiles(prev => ({
          ...prev,
          [booking_id]: allDocuments
        }));

        // Refresh appointments
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        const res = await fetchAppointmentsByUser(loggedUser.user_id);
        setAppointments(res.data);
      } else {
        throw new Error("No documents to save");
      }
    } catch (err) {
      console.error("Error updating documents:", err);
      alert("❌ Failed to update documents. Please try again.");
    }
  };

  // Handle view/download of files
  const handleDownload = (filename) => {
    if (!filename) {
      alert("❌ No file available!");
      return;
    }
    const url = `${import.meta.env.VITE_CLOUDINARY_URL}/${filename}`;
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

  // Get document type from filename
  const getDocumentType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'other';
  };

  // Existing Files Preview Component
  const ExistingFilesPreview = ({ booking_id }) => {
    const currentExistingFiles = existingFiles[booking_id] || [];
    
    if (currentExistingFiles.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h5 className="font-medium text-green-800 mb-3 flex items-center gap-2">
          💾 Existing Documents ({currentExistingFiles.length})
        </h5>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentExistingFiles.map((filename, index) => {
            const docType = getDocumentType(filename);
            const cloudinaryUrl = `${import.meta.env.VITE_CLOUDINARY_URL}/${filename}`;
            const markedForRemoval = isMarkedForRemoval(booking_id, filename);
            
            return (
              <div 
                key={`existing-${index}`} 
                className={`relative bg-white rounded-lg border-2 p-3 transition-all duration-200 ${
                  markedForRemoval 
                    ? 'border-red-300 bg-red-50 opacity-60' 
                    : 'border-green-300 hover:shadow-md'
                }`}
              >
                {/* Remove/Restore Button */}
                <button
                  onClick={() => markedForRemoval 
                    ? restoreExistingFile(booking_id, filename)
                    : markExistingFileForRemoval(booking_id, filename)
                  }
                  className={`absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors duration-200 z-10 ${
                    markedForRemoval
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {markedForRemoval ? '↶' : '✕'}
                </button>

                {/* File Preview Content */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => !markedForRemoval && handleDownload(filename)}
                >
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
                        <span className="text-3xl">{getFileIcon(docType)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 mb-2 flex items-center justify-center bg-gray-100 rounded-md">
                      <span className="text-3xl">{getFileIcon(docType)}</span>
                    </div>
                  )}
                  
                  {/* Document Info */}
                  <div className="w-full text-center">
                    <p className="text-xs font-medium text-gray-800 truncate mb-1" title={filename}>
                      {filename.length > 15 ? `${filename.substring(0, 15)}...` : filename}
                    </p>
                    <p className={`text-xs ${markedForRemoval ? 'text-red-600' : 'text-green-600'}`}>
                      {markedForRemoval ? 'Will be removed' : 'Click to view'}
                    </p>
                  </div>
                </div>

                {/* Removal overlay */}
                {markedForRemoval && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">REMOVING</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // New Files Preview Component
  const NewFilesPreview = ({ booking_id }) => {
    const previews = newFilePreviews[booking_id] || {};
    const selectedNewFiles = newFiles[booking_id] || [];
    
    if (selectedNewFiles.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          ➕ New Files to Upload ({selectedNewFiles.length})
        </h5>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedNewFiles.map((file, index) => {
            const preview = previews[index];
            
            return (
              <div 
                key={`new-${index}`} 
                className="relative bg-white rounded-lg border-2 border-blue-300 p-3 hover:shadow-md transition-shadow duration-200"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeNewFile(booking_id, index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 z-10"
                >
                  ✕
                </button>
                
                {/* New file indicator */}
                <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  +
                </div>

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

  // Document Preview Component for prescriptions
  const DocumentPreview = ({ documents, title, icon }) => {
    if (!documents || documents.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          {icon} {title} ({documents.length})
        </h5>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((filename, index) => {
            const docType = getDocumentType(filename);
            const cloudinaryUrl = `${import.meta.env.VITE_CLOUDINARY_URL}/${filename}`;
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => handleDownload(filename)}
              >
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
                        <span className="text-3xl">{getFileIcon(docType)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 mb-2 flex items-center justify-center bg-gray-100 rounded-md">
                      <span className="text-3xl">{getFileIcon(docType)}</span>
                    </div>
                  )}
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
    const prescriptions = appointment.booking_prescription ? JSON.parse(appointment.booking_prescription) : [];
    const hasNewFiles = (newFiles[appointment.booking_id] || []).length > 0;
    const hasFilesToRemove = (filesToRemove[appointment.booking_id] || []).length > 0;
    const hasChanges = hasNewFiles || hasFilesToRemove;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          📎 Document Management
        </h4>
        
        {/* Upload Section */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-3 items-center mb-2">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              onChange={(e) => handleNewFileChange(appointment.booking_id, e)}
              className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => handleUpload(appointment.booking_id)}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              💾 Save Changes
            </button>
          </div>
          
          {hasChanges && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
              💡 You have unsaved changes. Click "Save Changes" to update your documents.
            </div>
          )}
        </div>

        {/* File Previews */}
        <ExistingFilesPreview booking_id={appointment.booking_id} />
        <NewFilesPreview booking_id={appointment.booking_id} />

        {/* Prescription Documents (Read-only) */}
        <DocumentPreview 
          documents={prescriptions} 
          title="Prescriptions" 
          icon="💊" 
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
