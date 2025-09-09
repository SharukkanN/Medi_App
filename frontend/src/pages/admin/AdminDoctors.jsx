// src/pages/admin/Doctors.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

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
  const rowsPerPage = 10;

  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
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

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/doctor");
      const mappedDoctors = res.data.map((doc) => ({
        ...doc,
        doctor_available_date: doc.doctor_available_date?.split(",") || [],
      }));
      setDoctors(mappedDoctors);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const totalPages = Math.ceil(doctors.length / rowsPerPage);
  const currentData = doctors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handleBack = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const days = prev.doctor_available_date.includes(day)
        ? prev.doctor_available_date.filter((d) => d !== day)
        : [...prev.doctor_available_date, day];
      return { ...prev, doctor_available_date: days };
    });
  };

  // Delete doctor
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/doctor/${id}`);
      setDoctors(doctors.filter((d) => d.doctor_id !== id));
    } catch (err) {
      console.error("Error deleting doctor:", err);
    }
  };

  // Edit doctor
  const handleEditClick = (doc) => {
    setEditing(doc);
    setFormData({
      ...doc,
      doctor_available_date: doc.doctor_available_date || [],
    });
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ...formData,
        doctor_available_date: formData.doctor_available_date.join(","),
      };
      await axios.put(
        `http://localhost:4000/api/doctor/${editing.doctor_id}`,
        payload
      );
      setDoctors(
        doctors.map((d) =>
          d.doctor_id === editing.doctor_id ? { ...d, ...formData } : d
        )
      );
      setEditing(null);
    } catch (err) {
      console.error("Error updating doctor:", err);
    }
  };

  // Add doctor
  const handleAddDoctor = async () => {
    try {
      const payload = {
        ...formData,
        doctor_available_date: formData.doctor_available_date.join(","),
      };
      const res = await axios.post("http://localhost:4000/api/doctor", payload);
      setDoctors([res.data, ...doctors]);
      setAdding(false);
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
    } catch (err) {
      console.error("Error adding doctor:", err);
    }
  };

  if (loading)
    return <div className="p-6 text-center">Loading doctors...</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#5F6FFF]">Doctors</h1>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={() => setAdding(true)}
        >
          Add Doctor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="bg-[#5F6FFF] text-white text-left text-base text-center">
              <th className="px-4 py-2">No.</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Specialty</th>
              <th className="px-4 py-2">Available Days</th>
              <th className="px-4 py-2">Time Range</th>
              <th className="px-4 py-2">Fees</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {currentData.map((doc, index) => (
              <tr
                key={doc.doctor_id}
                className="text-center border-b hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </td>
                <td className="px-4 py-3">
                  {doc.doctor_firstname} {doc.doctor_lastname}
                </td>
                <td className="px-4 py-3">{doc.doctor_specialty}</td>
                <td className="px-4 py-3">
                  {doc.doctor_available_date?.join(", ")}
                </td>
                <td className="px-4 py-3">{doc.doctor_available_time}</td>
                <td className="px-4 py-3">{doc.doctor_fees}</td>
                <td className="px-4 py-3 flex justify-center gap-4">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleEditClick(doc)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(doc.doctor_id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-gray-500 text-sm"
                >
                  No doctors found
                </td>
              </tr>
            )}
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

      {/* Modal */}
      {(adding || editing) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-auto z-50 pt-20"
          onClick={() => {
            setAdding(false);
            setEditing(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setAdding(false);
                setEditing(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-semibold mb-4">
              {editing ? "Edit Doctor" : "Add Doctor"}
            </h2>

            {/* Form fields */}
            <div className="space-y-3 text-sm">
              {[
                { label: "Username", key: "doctor_username" },
                { label: "Password", key: "doctor_password", type: "password" },
                { label: "First Name", key: "doctor_firstname" },
                { label: "Last Name", key: "doctor_lastname" },
                { label: "Experience", key: "doctor_experience" },
                { label: "Bio", key: "doctor_bio" },
                { label: "Image URL", key: "doctor_image" },
                { label: "Email", key: "doctor_email" },
                { label: "Mobile", key: "doctor_mobile" },
                { label: "Time Range", key: "doctor_available_time" },
                { label: "Fees", key: "doctor_fees", type: "number" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block mb-1 font-medium">
                    {field.label}:
                  </label>
                  <input
                    type={field.type || "text"}
                    className="border px-3 py-2 rounded-lg w-full"
                    value={formData[field.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.key]: e.target.value })
                    }
                  />
                </div>
              ))}

              {/* Specialty Dropdown */}
              <div>
                <label className="block mb-1 font-medium">Specialty:</label>
                <select
                  className="border px-3 py-2 rounded-lg w-full"
                  value={formData.doctor_specialty}
                  onChange={(e) =>
                    setFormData({ ...formData, doctor_specialty: e.target.value })
                  }
                >
                  <option value="">Select Specialty</option>
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Days */}
              <div>
                <label className="block mb-1 font-medium">Available Days:</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <label key={day} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.doctor_available_date.includes(day)}
                        onChange={() => toggleDay(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setAdding(false);
                  setEditing(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={editing ? handleUpdate : handleAddDoctor}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
