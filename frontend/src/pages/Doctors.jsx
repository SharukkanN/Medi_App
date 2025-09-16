import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FaUserMd, 
  FaStar, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaTimes,
  FaClock,
  FaStethoscope,
  FaHeart,
  FaEye,
  FaBrain,
  FaLeaf,
  FaVenus,
  FaChild
} from "react-icons/fa";

const Doctors = () => {
  const { speciality } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [filterDoc, setFilterDoc] = useState([]);
  const [activeFilter, setActiveFilter] = useState(speciality || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Map());
  const navigate = useNavigate();

  // Enhanced specialist categories with icons
  const specialistCategories = [
    { name: "GP", icon: FaUserMd, color: "bg-blue-500", count: 0 },
    { name: "Urologist", icon: FaStethoscope, color: "bg-green-500", count: 0 },
    { name: "Gynecologist", icon: FaVenus, color: "bg-pink-500", count: 0 },
    { name: "Venereologist", icon: FaHeart, color: "bg-red-500", count: 0 },
    { name: "Fertility", icon: FaChild, color: "bg-purple-500", count: 0 },
    { name: "Psychologist", icon: FaBrain, color: "bg-indigo-500", count: 0 },
    { name: "Ayurvedic", icon: FaLeaf, color: "bg-emerald-500", count: 0 },
  ];

  // Fetch all doctors from backend
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/doctor");
      const data = await res.json();
      setDoctors(data);
      
      // Calculate counts for each specialty
      const _updatedCategories = specialistCategories.map(cat => ({
        ...cat,
        count: data.filter(doc => doc.doctor_specialty === cat.name).length
      }));
      
      // Apply initial filter if any
      if (activeFilter) {
        setFilterDoc(data.filter((doc) => doc.doctor_specialty === activeFilter));
      } else {
        setFilterDoc(data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Apply filter with search
  const applyFilter = (filter) => {
    setActiveFilter(filter);
    let filtered = doctors;
    
    if (filter) {
      filtered = doctors.filter((doc) => doc.doctor_specialty === filter);
      navigate(`/doctors/${filter}`);
    } else {
      navigate("/doctors");
    }

    // Apply search term if exists
    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        `${doc.doctor_firstname} ${doc.doctor_lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.doctor_specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilterDoc(filtered);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    let filtered = activeFilter 
      ? doctors.filter((doc) => doc.doctor_specialty === activeFilter)
      : doctors;

    if (term) {
      filtered = filtered.filter((doc) =>
        `${doc.doctor_firstname} ${doc.doctor_lastname}`.toLowerCase().includes(term.toLowerCase()) ||
        doc.doctor_specialty.toLowerCase().includes(term.toLowerCase())
      );
    }

    setFilterDoc(filtered);
  };

  // Get rating display (placeholder - you can integrate real ratings)
  const getRating = () => (4.0 + Math.random()).toFixed(1);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Find Your Perfect Healthcare Provider
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with experienced doctors and specialists in your area. Quality healthcare is just a click away.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <FaSearch className="absolute left-4 top-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Browse by Specialty</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg"
              >
                <FaFilter />
                Filters
              </button>
              <span className="text-gray-600">{filterDoc.length} doctors found</span>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className={`${showFilters || 'hidden md:block'} space-y-4`}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {specialistCategories.map((cat, index) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={index}
                    onClick={() => applyFilter(cat.name)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      activeFilter === cat.name
                        ? `${cat.color} text-white border-transparent shadow-lg transform scale-105`
                        : "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <IconComponent className="text-2xl" />
                      <span className="font-medium text-sm">{cat.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clear Filter */}
            {activeFilter && (
              <div className="flex justify-center">
                <button
                  onClick={() => applyFilter("")}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full border border-red-200 hover:bg-red-100 transition-all"
                >
                  <FaTimes />
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filterDoc.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUserMd className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No doctors found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filterDoc.map((doc) => (
              <div
                key={doc.doctor_id}
                onClick={() => navigate(`/appointment/${doc.doctor_id}`)}
                className="group bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300 border border-gray-100"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  {(() => {
                    const imageError = imageErrors.get(doc.doctor_id);
                    const initials = `${doc.doctor_firstname[0]}${doc.doctor_lastname[0]}`.toUpperCase();
                    return imageError ? (
                      <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                        {initials}
                      </div>
                    ) : (
                      <img
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        src={`https://res.cloudinary.com/dlpcwx94i/image/upload/v1757946102/${doc.doctor_image}`}
                        alt={`Dr. ${doc.doctor_firstname}`}
                        onError={() => setImageErrors(prev => new Map(prev).set(doc.doctor_id, true))}
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Available
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-xs" />
                      {getRating()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      Dr. {doc.doctor_firstname} {doc.doctor_lastname}
                    </h3>
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                      {doc.doctor_specialty}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-3 text-indigo-500" />
                      <span className="text-sm">{doc.doctor_experience} years experience</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-3 text-red-500" />
                      <span className="text-sm">Available today</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
