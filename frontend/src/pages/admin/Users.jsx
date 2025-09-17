// src/pages/admin/Users.jsx
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { getUsers, deleteUser } from "../../services/UserService";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalPages = Math.ceil(users.length / rowsPerPage);
  const currentData = users.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user.user_id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading users...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-[#5F6FFF]">Users</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#5F6FFF] text-white text-base">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Gender</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentData.map((user, index) => (
              <tr
                key={user.user_id}
                className="text-center border-b hover:bg-gray-100"
              >
                <td className="px-4 py-2">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </td>
                <td className="px-4 py-2">
                  {user.user_name || user.user_username}
                </td>
                <td className="px-4 py-2">{user.user_age}</td>
                <td className="px-4 py-2">{user.user_gender}</td>
                <td className="px-4 py-2">{user.user_email}</td>
                <td className="px-4 py-2">{user.user_phone}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(user.user_id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
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
    </div>
  );
};

export default Users;
