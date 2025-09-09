import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-50 text-gray-700 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-10">
        
        {/* Left Section */}
        <div>
          <h1
            className="text-3xl font-bold cursor-pointer mb-4"
            style={{ color: "#5f6FFF" }}
            onClick={() => navigate('/')}
          >
            MediPlus
          </h1>
          <p className="text-sm leading-relaxed mb-4">
            MediPlus is committed to providing world-class healthcare with compassion. 
            Your health and well-being are our priority. We ensure top-quality service 
            at every step.
          </p>
          {/* Social Media Icons */}
          <div className="flex gap-3 mt-2">
            <a href="#" className="p-2 bg-blue-600 text-white rounded-full hover:opacity-80 transition">
              <FaFacebookF size={16} />
            </a>
            <a href="#" className="p-2 bg-pink-500 text-white rounded-full hover:opacity-80 transition">
              <FaInstagram size={16} />
            </a>
            <a href="#" className="p-2 bg-blue-700 text-white rounded-full hover:opacity-80 transition">
              <FaLinkedinIn size={16} />
            </a>
          </div>
        </div>

        {/* Center Section */}
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
          <h2 className="text-xl font-semibold mb-5">Company</h2>
          <ul className="space-y-2 text-sm">
            <li onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600 transition">Home</li>
            <li onClick={() => navigate('/about')} className="cursor-pointer hover:text-blue-600 transition">About Us</li>
            <li onClick={() => navigate('/contact')} className="cursor-pointer hover:text-blue-600 transition">Contact Us</li>
            <li onClick={() => navigate('/privacy')} className="cursor-pointer hover:text-blue-600 transition">Privacy Policy</li>
          </ul>
        </div>

        {/* Right Section */}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-5">Get in Touch</h2>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-blue-600 transition">📞 +94 123 456 789</li>
            <li className="hover:text-blue-600 transition">📧 support@mediplus.com</li>
            <li className="hover:text-blue-600 transition">🏥 123 Medi Street, Colombo</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-300 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} MediPlus. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
