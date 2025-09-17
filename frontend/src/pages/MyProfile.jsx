import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { getUserById } from "../services/UserService";

const MyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUserData(data.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/bookings/user/${id}`
        );
        const data = await res.json();

        const now = new Date();
        const upcoming = data
          .filter((appt) => {
            if (appt.booking_status !== "Link") return false;
            const apptDateTime = new Date(
              `${appt.booking_date} ${appt.booking_time}`
            );
            return apptDateTime > now;
          })
          .sort(
            (a, b) =>
              new Date(`${a.booking_date} ${a.booking_time}`) -
              new Date(`${b.booking_date} ${b.booking_time}`)
          );

        setUpcomingAppointments(upcoming);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    fetchUser();
    fetchAppointments();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      console.log("Updated user:", data);
      setIsEdit(false);
    } catch (err) {
      console.error("Error saving user:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>User not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
        {/* LEFT: Profile Section */}
        <div className="col-span-2 bg-white shadow-xl rounded-2xl p-8 flex flex-col gap-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <img
              className="w-28 h-28 object-cover rounded-full shadow-md"
              src={userData.image || assets.profile_pic}
              alt="Profile"
            />
            <div>
              {isEdit ? (
                <input
                  type="text"
                  value={userData.user_name || ""}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      user_name: e.target.value,
                    }))
                  }
                  className="bg-gray-50 text-2xl font-semibold w-full py-2 rounded-md border px-3"
                />
              ) : (
                <p className="text-3xl font-bold text-gray-800">
                  {userData.user_name}
                </p>
              )}
              <p className="text-gray-500">{userData.user_email}</p>
              <button
                onClick={() => navigate("/step1")}
                className="mt-3 bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition"
              >
                Start Consultation
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
              📞 Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                {isEdit ? (
                  <input
                    type="text"
                    value={userData.user_phone || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        user_phone: e.target.value,
                      }))
                    }
                    className="bg-gray-100 rounded-md px-2 py-1 border"
                  />
                ) : (
                  <span>{userData.user_phone || "N/A"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
              🧾 Basic Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Gender:</span>
                {isEdit ? (
                  <select
                    value={userData.user_gender || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        user_gender: e.target.value,
                      }))
                    }
                    className="bg-gray-100 rounded-md px-2 py-1 border"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span>{userData.user_gender || "N/A"}</span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Age:</span>
                {isEdit ? (
                  <input
                    type="number"
                    value={userData.user_age || ""}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        user_age: e.target.value,
                      }))
                    }
                    className="bg-gray-100 rounded-md px-2 py-1 border"
                  />
                ) : (
                  <span>{userData.user_age || "N/A"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div>
            <button
              onClick={() => (isEdit ? handleSave() : setIsEdit(true))}
              className="w-full border border-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition font-semibold"
              disabled={saving}
            >
              {isEdit ? (saving ? "Saving..." : "Save Information") : "Edit"}
            </button>
          </div>
        </div>

        {/* RIGHT: Upcoming Appointments */}
        <div className="bg-white shadow-xl rounded-2xl p-6">
          <h3 className="text-lg font-bold text-indigo-700 mb-4">
            📅 Upcoming Appointments
          </h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appt, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  <p className="text-gray-700">
                    <strong>Doctor:</strong> Dr. {appt.doctor_firstname}{" "}
                    {appt.doctor_lastname}
                  </p>
                  <p className="text-gray-700">
                    <strong>Date:</strong> {appt.booking_date}
                  </p>
                  <p className="text-gray-700">
                    <strong>Time:</strong> {appt.booking_time}
                  </p>
                  {appt.booking_link && (
                    <a
                      href={appt.booking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-indigo-700 transition"
                    >
                      🚀 Join Consultation
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
