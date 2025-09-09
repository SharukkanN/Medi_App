import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Doctors = () => {
  const { speciality } = useParams(); // URL param for filter
  const [doctors, setDoctors] = useState([]); // all doctors
  const [filterDoc, setFilterDoc] = useState([]); // filtered doctors
  const [activeFilter, setActiveFilter] = useState(speciality || "");
  const navigate = useNavigate();

  // Specialist categories
  const specialistCategories = [
    "GP",
    "Urologist",
    "Gynecologist",
    "Venereologist",
    "Fertility",
    "Psychologist",
    "Ayurvedic",
  ];

  // Fetch all doctors from backend
  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/doctor");
      const data = await res.json();
      setDoctors(data);
      // Apply initial filter if any
      if (activeFilter) {
        setFilterDoc(data.filter((doc) => doc.doctor_specialty === activeFilter));
      } else {
        setFilterDoc(data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Apply filter
  const applyFilter = (filter) => {
    setActiveFilter(filter);
    if (filter) {
      setFilterDoc(doctors.filter((doc) => doc.doctor_specialty === filter));
      navigate(`/doctors/${filter}`);
    } else {
      setFilterDoc(doctors);
      navigate("/doctors");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Browse Doctors by Specialty
      </h2>
      <p className="text-gray-600 mb-6">
        Select a category to filter doctors or browse all available specialists.
      </p>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {specialistCategories.map((cat, index) => (
          <button
            key={index}
            onClick={() => applyFilter(cat)}
            className={`px-5 py-2 rounded-full border font-medium text-sm transition-all ${
              activeFilter === cat
                ? "bg-indigo-700 text-white border-indigo-700 shadow-lg"
                : "border-gray-300 text-gray-700 hover:bg-indigo-100"
            }`}
          >
            {cat}
          </button>
        ))}

        {/* Clear Filter Button in Red */}
        <button
          onClick={() => applyFilter("")}
          className="px-5 py-2 rounded-full border border-red-500 bg-red-100 text-red-700 font-medium hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
          Clear
        </button>
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filterDoc.length === 0 && (
          <p className="col-span-full text-gray-500 text-center text-lg mt-10">
            No doctors found in this category.
          </p>
        )}
        {filterDoc.map((doc) => (
          <div
            key={doc.doctor_id}
            onClick={() => navigate(`/appointment/${doc.doctor_id}`)}
            className="border rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 bg-white"
          >
            <div className="relative w-full h-48">
              <img
                className="w-full h-full object-cover"
                src={`http://localhost:4000/uploads/${doc.doctor_image}`}
                alt={`Dr. ${doc.doctor_firstname}`}
              />
              <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                Available
              </span>
            </div>
            <div className="p-4">
              <p className="text-gray-900 text-lg font-semibold">
                Dr. {doc.doctor_firstname} {doc.doctor_lastname}
              </p>
              <p className="text-indigo-600 font-medium mt-1">
                {doc.doctor_specialty}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {doc.doctor_experience} yrs experience
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;
