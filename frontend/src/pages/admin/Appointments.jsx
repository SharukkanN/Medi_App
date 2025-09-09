// src/pages/admin/Appointments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", status: "", link: "" });

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All"); // New: email / doctor / specialty
  const [search, setSearch] = useState("");

  const rowsPerPage = 10;

  // Fetch all bookings
  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/bookings/all");
      setAppointments(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filters
  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = filterStatus === "All" || appt.booking_status === filterStatus;

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
        // All: search across all
        matchesSearch =
          appt.user_email.toLowerCase().includes(searchLower) ||
          `${appt.doctor_firstname} ${appt.doctor_lastname}`.toLowerCase().includes(searchLower) ||
          appt.doctor_specialty?.toLowerCase().includes(searchLower);
      }
    }

    return matchesStatus && matchesSearch;
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
      await axios.put(
        `http://localhost:4000/api/bookings/update/${editing.booking_id}`,
        payload
      );
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
      await axios.delete(`http://localhost:4000/api/bookings/delete/${id}`);
      setAppointments((prev) => prev.filter((a) => a.booking_id !== id));
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading appointments...</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-[#5F6FFF] text-center">
        Appointments Dashboard
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-between items-center">
        <input
          type="text"
          placeholder={`Search by ${filterType === "All" ? "email, doctor or specialty" : filterType}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full md:w-1/3"
        />

        {/* <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="All">All</option>
          <option value="Email">Email</option>
          <option value="Doctor">Doctor</option>
          <option value="Specialty">Specialty</option>
        </select> */}

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Link">Link</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="bg-[#5F6FFF] text-white text-left text-base">
              <th className="px-6 py-3">No.</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Doctor</th>
              <th className="px-6 py-3">Booking Date</th>
              <th className="px-6 py-3">Booking Time</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Action</th>
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
            {currentData.map((appt, index) => (
              <tr
                key={appt.booking_id}
                className="border-b hover:bg-gray-50 transition-all text-gray-700"
              >
                <td className="px-6 py-4">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                <td className="px-6 py-4">{appt.user_email}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold">
                    {appt.doctor_firstname} {appt.doctor_lastname}
                  </div>
                  <div className="text-blue-600 text-xs">{appt.doctor_specialty}</div>
                </td>
                <td className="px-6 py-4">{appt.booking_date}</td>
                <td className="px-6 py-4">{appt.booking_time}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-white font-medium text-xs ${
                      appt.booking_status === "Confirmed"
                        ? "bg-green-500"
                        : appt.booking_status === "Pending"
                        ? "bg-yellow-500"
                        : appt.booking_status === "Processing"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {appt.booking_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center flex gap-3 justify-center">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleEditClick(appt)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(appt.booking_id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between mt-6 items-center">
          <button
            onClick={handleBack}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Back
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditing(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-[#5F6FFF]">
              Edit Appointment
            </h2>

            <div className="flex flex-col gap-4 text-sm">
              <label className="font-medium">Booking Date</label>
              <input
                type="date"
                className="border px-3 py-2 rounded-lg w-full"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />

              <label className="font-medium">Booking Time</label>
              <input
                type="time"
                className="border px-3 py-2 rounded-lg w-full"
                value={editForm.time}
                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
              />

              <label className="font-medium">Status</label>
              <select
                className="border px-3 py-2 rounded-lg w-full"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Link">Link</option>
              </select>

              {editForm.status === "Link" && (
                <>
                  <label className="font-medium">Enter Link</label>
                  <input
                    type="text"
                    className="border px-3 py-2 rounded-lg w-full"
                    placeholder="Paste your link here"
                    value={editForm.link}
                    onChange={(e) =>
                      setEditForm({ ...editForm, link: e.target.value })
                    }
                  />
                </>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
