// src/pages/admin/Doctors.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { uploadImage } from "../../api/ApiManager";
import { 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaEnvelope,
  FaPhone,
  FaUpload,
  FaImage,
  FaCamera
} from "react-icons/fa";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SPECIALTIES = [
  "GP",
  "Urologist", 
  "Gynecologist",
  "Venerologist",
  "Fertility",
  "Psychologist",
  "Ayurvedic",
];

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [formData, setFormData] = useState({
    doctor_username: "",
    doctor_password: "",
    doctor_firstname: "",
    doctor_lastname: "",
    doctor_specialty: "",
    doctor_experience: "",
    doctor_bio: "",
    doctor_image: "",
    doctor_email: "",
    doctor_mobile: "",
    doctor_available_time: "",
    doctor_available_date: [],
    doctor_fees: "",
  });

  // Enhanced fetch function with error handling
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/doctor");
      const mappedDoctors = res.data.map((doc) => ({
        ...doc,
        doctor_available_date: doc.doctor_available_date?.split(",") || [],
      }));
      setDoctors(mappedDoctors);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      // You might want to add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Enhanced file selection handler with drag and drop support
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
    if (!file) return;
    
    // Reset previous errors
    setFormErrors(prev => ({ ...prev, doctor_image: "" }));
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({ 
        ...prev, 
        doctor_image: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' 
      }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ 
        ...prev, 
        doctor_image: 'Image size should be less than 5MB' 
      }));
      return;
    }
    
    setSelectedImage(file);
    
    // Optional: Auto-upload immediately
    // const imageUrl = await handleImageUpload(file);
    // if (imageUrl) {
    //   setFormData({ ...formData, doctor_image: imageUrl });
    // }
  };

  // Clear image selection
  const clearImageSelection = () => {
    setSelectedImage(null);
  };

  // Enhanced filtering and sorting
  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = doctors.filter((doctor) => {
      const matchesSearch = 
        `${doctor.doctor_firstname} ${doctor.doctor_lastname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doctor.doctor_specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.doctor_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = !filterSpecialty || doctor.doctor_specialty === filterSpecialty;
      
      return matchesSearch && matchesSpecialty;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle name sorting specially
        if (sortConfig.key === 'name') {
          aValue = `${a.doctor_firstname} ${a.doctor_lastname}`;
          bValue = `${b.doctor_firstname} ${b.doctor_lastname}`;
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [doctors, searchTerm, filterSpecialty, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedDoctors.length / rowsPerPage);
  const currentData = filteredAndSortedDoctors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination handlers
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'doctor_username', 'doctor_password', 'doctor_firstname', 
      'doctor_lastname', 'doctor_specialty', 'doctor_email', 
      'doctor_mobile', 'doctor_fees', 'doctor_experience'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = 'This field is required';
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.doctor_email && !emailRegex.test(formData.doctor_email)) {
      errors.doctor_email = 'Please enter a valid email';
    }

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (formData.doctor_mobile && !mobileRegex.test(formData.doctor_mobile)) {
      errors.doctor_mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Available days validation
    if (formData.doctor_available_date.length === 0) {
      errors.doctor_available_date = 'Please select at least one available day';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const days = prev.doctor_available_date.includes(day)
        ? prev.doctor_available_date.filter((d) => d !== day)
        : [...prev.doctor_available_date, day];
      return { ...prev, doctor_available_date: days };
    });
  };

  // Enhanced delete with confirmation
  const handleDelete = async (doctor) => {
    if (!window.confirm(`Are you sure you want to delete Dr. ${doctor.doctor_firstname} ${doctor.doctor_lastname}?`)) return;
    
    try {
      await axios.delete(`http://localhost:4000/api/doctor/${doctor.doctor_id}`);
      setDoctors(doctors.filter((d) => d.doctor_id !== doctor.doctor_id));
      // Add success notification here
    } catch (err) {
      console.error("Error deleting doctor:", err);
      // Add error notification here
    }
  };

  // Edit handler
  const handleEditClick = (doc) => {
    setEditing(doc);
    setFormData({
      ...doc,
      doctor_available_date: doc.doctor_available_date || [],
    });
    setFormErrors({});
    setSelectedImage(null);
  };

  // View handler
  const handleViewClick = (doc) => {
    setSelectedDoctor(doc);
    setViewMode(true);
  };

  // Update handler
  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    try {
      let publicId = formData.doctor_image; // Keep existing image if no new one uploaded
      
      // Upload image if a new one was selected
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append('image', selectedImage);
        
        const uploadResponse = await uploadImage(formDataImage);
        if (uploadResponse.data.success) {
          publicId = uploadResponse.data.publicId;
        } else {
          throw new Error('Image upload failed');
        }
      }
      
      const payload = {
        ...formData,
        doctor_image: publicId,
        doctor_available_date: formData.doctor_available_date.join(","),
      };
      
      await axios.put(
        `http://localhost:4000/api/doctor/${editing.doctor_id}`,
        payload
      );
      
      setDoctors(
        doctors.map((d) =>
          d.doctor_id === editing.doctor_id 
            ? { ...d, ...formData, doctor_image: publicId } 
            : d
        )
      );
      
      setEditing(null);
      resetForm();
      // Add success notification here
    } catch (err) {
      console.error("Error updating doctor:", err);
      // Add error notification here
    } finally {
      setSubmitLoading(false);
    }
  };

  // Add handler
  const handleAddDoctor = async () => {
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    try {
      let publicId = "";
      
      // Upload image if selected
      if (selectedImage) {
        const formDataImage = new FormData();
        formDataImage.append('image', selectedImage);
        
        const uploadResponse = await uploadImage(formDataImage);
        if (uploadResponse.data.success) {
          publicId = uploadResponse.data.publicId;
        } else {
          throw new Error('Image upload failed');
        }
      }
      
      const payload = {
        ...formData,
        doctor_image: publicId,
        doctor_available_date: formData.doctor_available_date.join(","),
      };
      
      const res = await axios.post("http://localhost:4000/api/doctor", payload);
      setDoctors([{ ...res.data, doctor_available_date: formData.doctor_available_date, doctor_image: formData.doctor_image }, ...doctors]);
      setAdding(false);
      resetForm();
      // Add success notification here
    } catch (err) {
      console.error("Error adding doctor:", err);
      // Add error notification here
    } finally {
      setSubmitLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      doctor_username: "",
      doctor_password: "",
      doctor_firstname: "",
      doctor_lastname: "",
      doctor_specialty: "",
      doctor_experience: "",
      doctor_bio: "",
      doctor_image: "",
      doctor_email: "",
      doctor_mobile: "",
      doctor_available_time: "",
      doctor_available_date: [],
      doctor_fees: "",
    });
    setFormErrors({});
    setSelectedImage(null);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setAdding(false);
    setEditing(null);
    setViewMode(false);
    setSelectedDoctor(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F6FFF]"></div>
          <p className="text-gray-600 font-medium">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#5F6FFF] rounded-xl">
            <FaUserMd className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctors Management</h1>
            <p className="text-gray-600 mt-1">Manage your medical professionals</p>
          </div>
        </div>
        
        <button
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={() => setAdding(true)}
        >
          <FaPlus className="text-sm" />
          <span className="font-medium">Add Doctor</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, specialty, or email..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Specialty Filter */}
          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all duration-200 bg-white min-w-[200px]"
              value={filterSpecialty}
              onChange={(e) => {
                setFilterSpecialty(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Specialties</option>
              {SPECIALTIES.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          
          {/* Rows per page */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-medium">Show:</span>
            <select
              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-600">
            Showing {currentData.length} of {filteredAndSortedDoctors.length} doctors
            {searchTerm && ` for "${searchTerm}"`}
            {filterSpecialty && ` in ${filterSpecialty}`}
          </p>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-[#5F6FFF] to-[#7B8CFF] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('doctor_id')}>
                    <span>No.</span>
                    {sortConfig.key === 'doctor_id' ? (
                      sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                    ) : <FaSort className="opacity-50" />}
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('name')}>
                    <span>Doctor</span>
                    {sortConfig.key === 'name' ? (
                      sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                    ) : <FaSort className="opacity-50" />}
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('doctor_specialty')}>
                    <span>Specialty</span>
                    {sortConfig.key === 'doctor_specialty' ? (
                      sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                    ) : <FaSort className="opacity-50" />}
                  </div>
                </th>
                <th className="px-6 py-4 text-left font-semibold">Contact</th>
                <th className="px-6 py-4 text-left font-semibold">Schedule</th>
                <th className="px-6 py-4 text-left font-semibold">
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('doctor_fees')}>
                    <span>Fees</span>
                    {sortConfig.key === 'doctor_fees' ? (
                      sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                    ) : <FaSort className="opacity-50" />}
                  </div>
                </th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.map((doc, index) => (
                <tr key={doc.doctor_id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {doc.doctor_image ? (
                          <img
                            src={`https://res.cloudinary.com/dlpcwx94i/image/upload/v1757946102/${doc.doctor_image}`}
                            alt={`Dr. ${doc.doctor_firstname} ${doc.doctor_lastname}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-10 h-10 bg-gradient-to-br from-[#5F6FFF] to-[#7B8CFF] rounded-full flex items-center justify-center text-white font-semibold ${
                            doc.doctor_image ? 'hidden' : 'flex'
                          }`}
                        >
                          {doc.doctor_firstname?.[0]}{doc.doctor_lastname?.[0]}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Dr. {doc.doctor_firstname} {doc.doctor_lastname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {doc.doctor_experience} years exp.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {doc.doctor_specialty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaEnvelope className="text-xs" />
                        <span>{doc.doctor_email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaPhone className="text-xs" />
                        <span>{doc.doctor_mobile}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-xs" />
                        <span className="text-xs">
                          {doc.doctor_available_date?.slice(0, 3).join(", ")}
                          {doc.doctor_available_date?.length > 3 && ` +${doc.doctor_available_date.length - 3}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaClock className="text-xs" />
                        <span className="text-xs">{doc.doctor_available_time}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-green-600 font-semibold">
                      <FaDollarSign className="text-sm" />
                      <span>{doc.doctor_fees}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        onClick={() => handleViewClick(doc)}
                        title="View Details"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      <button
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors duration-150"
                        onClick={() => handleEditClick(doc)}
                        title="Edit Doctor"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        onClick={() => handleDelete(doc)}
                        title="Delete Doctor"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <FaUserMd className="text-4xl text-gray-300" />
                      <p className="text-gray-500 font-medium">No doctors found</p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm || filterSpecialty 
                          ? "Try adjusting your search or filter criteria"
                          : "Add your first doctor to get started"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                {Math.min(currentPage * rowsPerPage, filteredAndSortedDoctors.length)} of{' '}
                {filteredAndSortedDoctors.length} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBack}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <FaChevronLeft className="text-xs" />
                  <span>Previous</span>
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                            currentPage === pageNum
                              ? 'bg-[#5F6FFF] text-white'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <span>Next</span>
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Modal for Add/Edit */}
      {(adding || editing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-auto z-50 pt-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 mb-8 max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#5F6FFF] to-[#7B8CFF] text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editing ? "Edit Doctor" : "Add New Doctor"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-150"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              <form className="space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative group">
                        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-[#5F6FFF] to-[#7B8CFF]">
                          {(selectedImage || formData.doctor_image) ? (
                            <>
                              <img
                                src={selectedImage ? URL.createObjectURL(selectedImage) : `https://res.cloudinary.com/dlpcwx94i/image/upload/v1757946102/${formData.doctor_image}`}
                                alt="Doctor Profile"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              {/* Overlay on hover */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById('image-upload').click()}
                                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                                    title="Change Image"
                                  >
                                    <FaEdit className="text-gray-700" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      clearImageSelection();
                                      setFormData({ ...formData, doctor_image: "" });
                                    }}
                                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                                    title="Remove Image"
                                  >
                                    <FaTrash className="text-red-600" />
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            /* Placeholder when no image */
                            <div className="w-full h-full flex flex-col items-center justify-center text-white">
                              <FaUserMd className="text-4xl mb-2 opacity-80" />
                              <span className="text-sm font-medium opacity-90">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick upload button */}
                        <button
                          type="button"
                          onClick={() => document.getElementById('image-upload').click()}
                          className="absolute -bottom-2 -right-2 p-3 bg-[#5F6FFF] text-white rounded-full shadow-lg hover:bg-[#5A6BF5] transition-all duration-200 hover:scale-110"
                          title="Upload Image"
                        >
                          <FaCamera className="text-sm" />
                        </button>
                      </div>
                      
                      {/* Hidden file input */}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FaUserMd className="text-[#5F6FFF]" />
                    <span>Personal Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Username", key: "doctor_username", required: true },
                      { label: "Password", key: "doctor_password", type: "password", required: true },
                      { label: "First Name", key: "doctor_firstname", required: true },
                      { label: "Last Name", key: "doctor_lastname", required: true },
                      { label: "Email", key: "doctor_email", type: "email", required: true },
                      { label: "Mobile", key: "doctor_mobile", required: true },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={field.type || "text"}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all duration-200 ${
                            formErrors[field.key] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          value={formData[field.key]}
                          onChange={(e) =>
                            setFormData({ ...formData, [field.key]: e.target.value })
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                        {formErrors[field.key] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[field.key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Professional Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Specialty Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialty <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all duration-200 ${
                          formErrors.doctor_specialty ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        value={formData.doctor_specialty}
                        onChange={(e) =>
                          setFormData({ ...formData, doctor_specialty: e.target.value })
                        }
                      >
                        <option value="">Select Specialty</option>
                        {SPECIALTIES.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      {formErrors.doctor_specialty && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.doctor_specialty}</p>
                      )}
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (years) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all duration-200 ${
                          formErrors.doctor_experience ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        value={formData.doctor_experience}
                        onChange={(e) =>
                          setFormData({ ...formData, doctor_experience: e.target.value })
                        }
                        placeholder="Enter years of experience"
                        min="0"
                      />
                      {formErrors.doctor_experience && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.doctor_experience}</p>
                      )}
                    </div>

                    {/* Fees */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Fees ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all duration-200 ${
                          formErrors.doctor_fees ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        value={formData.doctor_fees}
                        onChange={(e) =>
                          setFormData({ ...formData, doctor_fees: e.target.value })
                        }
                        placeholder="Enter consultation fees"
                        min="0"
                      />
                      {formErrors.doctor_fees && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.doctor_fees}</p>
                      )}
                    </div>

                    {/* Available Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all duration-200"
                        value={formData.doctor_available_time}
                        onChange={(e) =>
                          setFormData({ ...formData, doctor_available_time: e.target.value })
                        }
                        placeholder="e.g., 9:00 AM - 5:00 PM"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio/Description
                    </label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all duration-200"
                      value={formData.doctor_bio}
                      onChange={(e) =>
                        setFormData({ ...formData, doctor_bio: e.target.value })
                      }
                      placeholder="Brief description about the doctor..."
                    />
                  </div>
                </div>

                {/* Schedule Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Schedule & Availability
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Available Days <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map((day) => (
                        <label
                          key={day}
                          className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            formData.doctor_available_date.includes(day)
                              ? 'border-[#5F6FFF] bg-[#5F6FFF] text-white'
                              : 'border-gray-200 hover:border-[#5F6FFF] hover:bg-[#5F6FFF] hover:bg-opacity-10'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.doctor_available_date.includes(day)}
                            onChange={() => toggleDay(day)}
                          />
                          <span className="text-sm font-medium">{day}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.doctor_available_date && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.doctor_available_date}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-150"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editing ? handleUpdate : handleAddDoctor}
                  disabled={submitLoading}
                  className="px-6 py-2 bg-gradient-to-r from-[#5F6FFF] to-[#7B8CFF] text-white rounded-xl hover:from-[#5A6BF5] hover:to-[#748AFF] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>
                        {editing ? "Updating..." : "Adding..."}
                      </span>
                    </>
                  ) : (
                    <span>{editing ? "Update Doctor" : "Add Doctor"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewMode && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-auto z-50 pt-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 mb-8 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Doctor Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-150"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Doctor Header with Image */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="relative">
                    {selectedDoctor.doctor_image ? (
                      <img
                        src={`https://res.cloudinary.com/dlpcwx94i/image/upload/v1757946102/${selectedDoctor.doctor_image}`}
                        alt={`Dr. ${selectedDoctor.doctor_firstname} ${selectedDoctor.doctor_lastname}`}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-20 h-20 bg-gradient-to-br from-[#5F6FFF] to-[#7B8CFF] rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg ${
                        selectedDoctor.doctor_image ? 'hidden' : 'flex'
                      }`}
                    >
                      {selectedDoctor.doctor_firstname?.[0]}{selectedDoctor.doctor_lastname?.[0]}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Dr. {selectedDoctor.doctor_firstname} {selectedDoctor.doctor_lastname}
                    </h3>
                    <p className="text-blue-600 font-medium">{selectedDoctor.doctor_specialty}</p>
                    <p className="text-gray-600">{selectedDoctor.doctor_experience} years experience</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaEnvelope className="text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedDoctor.doctor_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaPhone className="text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Mobile</p>
                        <p className="font-medium">{selectedDoctor.doctor_mobile}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Schedule & Availability</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaCalendarAlt className="text-blue-500" />
                        <p className="text-sm text-gray-600">Available Days</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoctor.doctor_available_date?.map((day) => (
                          <span
                            key={day}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaClock className="text-orange-500" />
                        <p className="text-sm text-gray-600">Time Range</p>
                      </div>
                      <p className="font-medium">{selectedDoctor.doctor_available_time || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Fees */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Consultation Fees</h4>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <FaDollarSign className="text-green-600 text-xl" />
                      <span className="text-2xl font-bold text-green-600">{selectedDoctor.doctor_fees}</span>
                      <span className="text-gray-600">per consultation</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedDoctor.doctor_bio && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">About</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{selectedDoctor.doctor_bio}</p>
                    </div>
                  </div>
                )}

                {/* Login Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Login Credentials</h4>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-2">Username</p>
                    <p className="font-mono font-medium">{selectedDoctor.doctor_username}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-150"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewMode(false);
                    handleEditClick(selectedDoctor);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-150"
                >
                  Edit Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
