import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../services/BookingService";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [bankSlip, setBankSlip] = useState(null);
  const [bankSlipPreview, setBankSlipPreview] = useState(null);

  useEffect(() => {
    // Get logged-in user from localStorage
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedUser) {
      alert("⚠️ You must login first!");
      navigate("/signin");
      return;
    }
    setEmail(loggedUser.email || "");
    setMobile(loggedUser.mobile || "");
    setUserId(loggedUser.user_id || "");
  }, [navigate]);

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Booking Information
          </h3>
          <p className="text-gray-600 mb-6">
            Please go back and select an appointment to continue.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { doctor, time, date } = bookingData;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          bankSlip: 'Please upload a valid file (JPG, PNG, or PDF)'
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          bankSlip: 'File size must be less than 5MB'
        }));
        return;
      }

      setBankSlip(file);
      setErrors(prev => ({ ...prev, bankSlip: null }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setBankSlipPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setBankSlipPreview(null);
      }
    }
  };

  const removeFile = () => {
    setBankSlip(null);
    setBankSlipPreview(null);
    setErrors(prev => ({ ...prev, bankSlip: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (mobile && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(mobile)) {
      newErrors.mobile = "Please enter a valid mobile number";
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (paymentMethod === "bank_transfer" && !bankSlip) {
      newErrors.bankSlip = "Please upload your bank transfer slip";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    const bookingBody = {
      user_id: userId,
      user_email: email,
      user_mobile: mobile,
      doctor_firstname: doctor.doctor_firstname,
      doctor_lastname: doctor.doctor_lastname,
      doctor_specialty: doctor.doctor_specialty,
      booking_date: date,
      booking_time: time + ":00",
      booking_fees: parseInt(doctor.doctor_fees) || 0,
      booking_receipt: bankSlip || null,
      booking_prescription: null,
      booking_user_doc: null,
      booking_status: "Pending",
      payment_method: paymentMethod
    };

    try {
      // If there's a bank slip file, create FormData for file upload
      if (bankSlip) {
        const formData = new FormData();
        Object.keys(bookingBody).forEach(key => {
          if (key === 'booking_receipt') {
            formData.append(key, bankSlip);
          } else {
            formData.append(key, bookingBody[key]);
          }
        });
        await createBooking(formData);
      } else {
        await createBooking(bookingBody);
      }
      
      alert("🎉 Booking successful! We'll send you a confirmation email shortly.");
      navigate("/my-appointments");
    } catch (error) {
      alert("❌ Booking failed: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Confirm Your Booking
          </h1>
          <p className="text-gray-600 text-lg">
            Review your appointment details and complete your booking
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {doctor.doctor_firstname?.charAt(0)}{doctor.doctor_lastname?.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Dr. {doctor.doctor_firstname} {doctor.doctor_lastname}
                </h3>
                <p className="text-blue-600 font-medium">{doctor.doctor_specialty}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Appointment Date</p>
                    <p className="font-semibold text-gray-900">{date}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">⏰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-gray-900">{time}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-yellow-50 rounded-xl">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="font-bold text-green-600 text-lg">
                      Rs. {doctor.doctor_fees || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm">
                      1
                    </span>
                    Contact Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        <span className="absolute left-4 top-3.5 text-gray-400 text-lg">📧</span>
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="Enter your mobile number"
                          className={`w-full px-4 py-3 pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.mobile ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                        <span className="absolute left-4 top-3.5 text-gray-400 text-lg">📱</span>
                      </div>
                      {errors.mobile && (
                        <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm">
                      2
                    </span>
                    Payment Method
                  </h3>
                  
                  <div className="space-y-3">
                    <div 
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        paymentMethod === "card" 
                          ? 'border-blue-500 bg-blue-50' 
                          : errors.paymentMethod 
                            ? 'border-red-300' 
                            : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex items-center">
                          <span className="text-2xl mr-3">💳</span>
                          <div>
                            <p className="font-medium text-gray-900">Card Payment</p>
                            <p className="text-sm text-gray-600">Pay securely with your credit or debit card</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div 
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        paymentMethod === "bank_transfer" 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod("bank_transfer")}
                    >
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="bank_transfer"
                          checked={paymentMethod === "bank_transfer"}
                          onChange={() => setPaymentMethod("bank_transfer")}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex items-center">
                          <span className="text-2xl mr-3">🏦</span>
                          <div>
                            <p className="font-medium text-gray-900">Bank Transfer</p>
                            <p className="text-sm text-gray-600">Transfer to our bank account and upload the slip</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-2">{errors.paymentMethod}</p>
                  )}
                </div>

                {/* Bank Transfer Upload Section */}
                {paymentMethod === "bank_transfer" && (
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Upload Bank Transfer Slip
                    </h4>
                    
                    {/* Bank Details */}
                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Transfer to:</h5>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><strong>Bank:</strong> Commercial Bank of Ceylon</p>
                        <p><strong>Account Name:</strong> Healthcare Services (Pvt) Ltd</p>
                        <p><strong>Account Number:</strong> 8001234567</p>
                        <p><strong>Branch:</strong> Colombo 03</p>
                        <p className="text-green-600 font-medium">Amount: Rs. {doctor.doctor_fees}</p>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      {!bankSlip ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            id="bankSlip"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="bankSlip"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                              <span className="text-3xl">📄</span>
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-2">
                              Upload Bank Slip
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                              Click to browse or drag and drop your file here
                            </p>
                            <div className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                              Choose File
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Supported formats: JPG, PNG, PDF (Max 5MB)
                            </p>
                          </label>
                        </div>
                      ) : (
                        <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-xl">
                                  {bankSlip.type.startsWith('image/') ? '🖼️' : '📄'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{bankSlip.name}</p>
                                <p className="text-sm text-gray-600">
                                  {(bankSlip.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              <span className="text-xl">🗑️</span>
                            </button>
                          </div>
                          
                          {/* Image Preview */}
                          {bankSlipPreview && (
                            <div className="mt-4">
                              <img
                                src={bankSlipPreview}
                                alt="Bank slip preview"
                                className="max-w-full h-48 object-contain rounded-lg border"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {errors.bankSlip && (
                        <p className="text-red-500 text-sm">{errors.bankSlip}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Important Notes:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Please arrive 15 minutes before your scheduled appointment</li>
                      <li>• Bring a valid ID and any relevant medical documents</li>
                      <li>• Cancellations must be made at least 24 hours in advance</li>
                      <li>• For bank transfers, your booking will be confirmed after payment verification</li>
                      <li>• You will receive a confirmation email shortly after booking</li>
                    </ul>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">🎯</span>
                        {paymentMethod === "bank_transfer" ? "Submit Booking" : "Confirm Booking"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
