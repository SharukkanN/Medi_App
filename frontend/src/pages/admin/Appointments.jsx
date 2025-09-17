// src/pages/admin/Appointments.jsx
import React, { useEffect, useState } from "react";
import { 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaEnvelope,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaDownload
} from "react-icons/fa";
import { fetchAppointments, updateAppointment, deleteAppointment } from "../../services/BookingService";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", status: "", link: "" });
  const [viewingDetails, setViewingDetails] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const rowsPerPage = 10;

  // Fetch all bookings
  const loadAppointments = async () => {
    try {
      const res = await fetchAppointments();
      setAppointments(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Enhanced filters
  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = filterStatus === "All" || appt.booking_status === filterStatus;
    const matchesDate = !dateFilter || appt.booking_date === dateFilter;

    let matchesSearch = true;
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      if (filterType === "Email") {
        matchesSearch = appt.user_email.toLowerCase().includes(searchLower);
      } else if (filterType === "Doctor") {
        matchesSearch = `${appt.doctor_firstname} ${appt.doctor_lastname}`
          .toLowerCase()
          .includes(searchLower);
      } else if (filterType === "Specialty") {
        matchesSearch = appt.doctor_specialty?.toLowerCase().includes(searchLower);
      } else {
        matchesSearch =
          appt.user_email.toLowerCase().includes(searchLower) ||
          `${appt.doctor_firstname} ${appt.doctor_lastname}`.toLowerCase().includes(searchLower) ||
          appt.doctor_specialty?.toLowerCase().includes(searchLower);
      }
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);
  const currentData = filteredAppointments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handleBack = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleEditClick = (appt) => {
    setEditing(appt);
    setEditForm({
      date: appt.booking_date,
      time: appt.booking_time,
      status: appt.booking_status,
      link: appt.booking_link || "",
    });
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        booking_date: editForm.date,
        booking_time: editForm.time,
        booking_status: editForm.status,
        booking_link: editForm.link || null,
      };
      await updateAppointment(editing.booking_id, payload);
      setAppointments((prev) =>
        prev.map((a) => (a.booking_id === editing.booking_id ? { ...a, ...payload } : a))
      );
      setEditing(null);
    } catch (err) {
      console.error("Error updating appointment:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.booking_id !== id));
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Pending: "bg-amber-100 text-amber-800 border-amber-200",
      Processing: "bg-blue-100 text-blue-800 border-blue-200",
      Link: "bg-purple-100 text-purple-800 border-purple-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Confirmed: "✓",
      Pending: "⏳",
      Processing: "🔄",
      Link: "🔗",
      Cancelled: "✕"
    };
    return icons[status] || "•";
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F6FFF] mb-4"></div>
          <p className="text-gray-600 font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-[#5F6FFF] rounded-xl">
              <FaCalendarAlt className="text-white" />
            </div>
            Appointments
          </h1>
        </div>
        <p className="text-gray-600">Manage and track all appointment bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Appointments", value: appointments.length, color: "bg-blue-500", icon: FaCalendarAlt },
          { label: "Confirmed", value: appointments.filter(a => a.booking_status === "Confirmed").length, color: "bg-emerald-500", icon: FaUserMd },
          { label: "Pending", value: appointments.filter(a => a.booking_status === "Pending").length, color: "bg-amber-500", icon: FaClock },
          { label: "This Month", value: appointments.filter(a => new Date(a.booking_date).getMonth() === new Date().getMonth()).length, color: "bg-purple-500", icon: FaCalendarAlt }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-[#5F6FFF]" />
          <h3 className="font-semibold text-gray-800">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search by ${filterType === "All" ? "email, doctor or specialty" : filterType.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all"
          >
            <option value="All">Search All Fields</option>
            <option value="Email">Search by Email</option>
            <option value="Doctor">Search by Doctor</option>
            <option value="Specialty">Search by Specialty</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Link">Link</option>
          </select>

          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#5F6FFF] to-[#4F5FEF] text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold">No.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <FaEnvelope />
                    Patient
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <FaUserMd />
                    Doctor
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    Date & Time
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <FaCalendarAlt className="text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">No appointments found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
              {currentData.map((appt, index) => (
                <tr
                  key={appt.booking_id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-gray-600 font-medium">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {appt.user_email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{appt.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Dr. {appt.doctor_firstname} {appt.doctor_lastname}
                      </p>
                      <p className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-1 rounded-md inline-block mt-1">
                        {appt.doctor_specialty}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{appt.booking_date}</p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <FaClock />
                          {appt.booking_time}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appt.booking_status)}`}>
                      {getStatusIcon(appt.booking_status)} {appt.booking_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => setViewingDetails(appt)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        onClick={() => handleEditClick(appt)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(appt.booking_id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Showing</span>
            <span className="font-semibold text-gray-800">
              {Math.min((currentPage - 1) * rowsPerPage + 1, filteredAppointments.length)}
            </span>
            <span>to</span>
            <span className="font-semibold text-gray-800">
              {Math.min(currentPage * rowsPerPage, filteredAppointments.length)}
            </span>
            <span>of</span>
            <span className="font-semibold text-gray-800">{filteredAppointments.length}</span>
            <span>results</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#5F6FFF] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaEdit className="text-[#5F6FFF]" />
                  Edit Appointment
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-2" />
                    Booking Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaClock className="inline mr-2" />
                    Booking Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Link">Link</option>
                  </select>
                </div>

                {editForm.status === "Link" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5F6FFF] focus:border-transparent transition-all"
                      placeholder="https://meet.google.com/..."
                      value={editForm.link}
                      onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-6 py-3 bg-[#5F6FFF] text-white rounded-xl hover:bg-[#4F5FEF] transition-colors font-medium"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {viewingDetails && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setViewingDetails(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaEye className="text-[#5F6FFF]" />
                  Appointment Details
                </h2>
                <button
                  onClick={() => setViewingDetails(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Patient Information</h3>
                  <p className="text-gray-600">{viewingDetails.user_email}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Doctor Information</h3>
                  <p className="text-gray-800 font-medium">
                    Dr. {viewingDetails.doctor_firstname} {viewingDetails.doctor_lastname}
                  </p>
                  <p className="text-blue-600 text-sm">{viewingDetails.doctor_specialty}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Appointment Schedule</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500" />
                      <span>{viewingDetails.booking_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-gray-500" />
                      <span>{viewingDetails.booking_time}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(viewingDetails.booking_status)}`}>
                    {getStatusIcon(viewingDetails.booking_status)} {viewingDetails.booking_status}
                  </span>
                </div>

                {viewingDetails.booking_link && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Meeting Link</h3>
                    <a
                      href={viewingDetails.booking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {viewingDetails.booking_link}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setViewingDetails(null);
                    handleEditClick(viewingDetails);
                  }}
                  className="flex-1 px-6 py-3 bg-[#5F6FFF] text-white rounded-xl hover:bg-[#4F5FEF] transition-colors font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
