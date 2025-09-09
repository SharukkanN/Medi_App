import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUserPlus,
  FaClipboardList,
  FaQuestionCircle,
  FaFileMedical,
  FaLeaf,
  FaUserMd,
  FaCalendarCheck,
} from "react-icons/fa";

const steps = [
  { id: 1, title: "Register / Login", icon: <FaUserPlus /> },
  { id: 2, title: "Choose Checkup", icon: <FaClipboardList /> },
  { id: 3, title: "Answer 10 Questions", icon: <FaQuestionCircle /> },
  { id: 4, title: "Get Health Summary", icon: <FaFileMedical /> },
  { id: 5, title: "Select Ayurvedic / Western", icon: <FaLeaf /> },
  { id: 6, title: "View Doctor Profile", icon: <FaUserMd /> },
  { id: 7, title: "Book & Pay", icon: <FaCalendarCheck /> },
];

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-[#feedd6] rounded-3xl px-6 sm:px-10 md:px-14 lg:px-20 py-16 my-20 shadow-lg overflow-hidden">
      
      {/* Background Bubbles */}
      <div className="absolute top-0 left-10 w-32 h-32 bg-[#5f6FFF]/20 rounded-full animate-bounce-slow opacity-30"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-[#5f6FFF]/30 rounded-full animate-spin-slow opacity-25"></div>
      <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-[#5f6FFF]/20 rounded-full animate-pulse-slow opacity-20"></div>
      <div className="absolute bottom-20 right-10 w-28 h-28 bg-[#5f6FFF]/25 rounded-full animate-bounce-reverse opacity-25"></div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-black text-center mb-12 leading-snug">
        Sexual Health Services – 7 Simple Steps
      </h2>

      {/* Stepper */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex flex-col items-center text-center relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3, duration: 0.6 }}
          >
            {/* Circle */}
            <motion.div
              className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-[#5f6FFF] text-2xl shadow-md border-2 border-[#5f6FFF] transition group-hover:scale-110"
              whileHover={{ scale: 1.1, boxShadow: "0 0 20px #5f6FFF40" }}
            >
              {step.icon}
            </motion.div>

            {/* Title */}
            <p className="mt-3 text-sm sm:text-base font-medium text-gray-800 max-w-[120px]">
              {step.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex justify-center mt-12 relative z-10">
        <motion.button
          onClick={() => {
            navigate("/login");
            scrollTo(0, 0);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#5f6FFF] text-white font-semibold px-10 py-3 rounded-full shadow-md hover:shadow-lg transition"
        >
          Get Started
        </motion.button>
      </div>

      {/* Bubble Animations CSS */}
      <style>
        {`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-bounce-slow { animation: bounce-slow 6s infinite; }

          @keyframes bounce-reverse {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(15px); }
          }
          .animate-bounce-reverse { animation: bounce-reverse 7s infinite; }

          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow { animation: spin-slow 25s linear infinite; }

          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
};

export default Banner;
