import React, { useState, useEffect } from "react";

const Header = () => {
  const [count, setCount] = useState(0);

  // Animated counter
  useEffect(() => {
    const end = 10000; 
    const duration = 3000;
    const increment = 100;
    const stepTime = Math.floor(duration / (end / increment));

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setCount(current);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#feedd6] rounded-xl px-6 md:px-10 lg:px-20 py-16 flex flex-col md:flex-row items-center gap-8">
      {/* Background Bubbles */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-[#5f6FFF] rounded-full opacity-30 animate-bounce-slow mix-blend-multiply"></div>
      <div className="absolute top-20 left-1/4 w-24 h-24 bg-[#5f6FFF]/30 rounded-full opacity-25 animate-spin-slow"></div>
      <div className="absolute top-32 right-10 w-32 h-32 bg-[#5f6FFF]/20 rounded-full opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-10 w-36 h-36 bg-[#5f6FFF]/30 rounded-full opacity-30 animate-bounce-reverse"></div>
      <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-[#5f6FFF]/25 rounded-full opacity-25 animate-spin-reverse"></div>
      <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-[#5f6FFF]/20 rounded-full opacity-20 animate-pulse-slow"></div>

      {/* Left Content */}
      <div className="relative z-10 md:w-1/2 flex flex-col gap-4">
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight md:leading-tight lg:leading-tight">
          Sri Lanka’s First Trusted Online Sexual Health Platform
        </p>

        <p className="text-gray text-sm md:text-base font-light mt-2">
          Confidential, expert care from certified sexual health professionals. 
          Consult safely from home via video, audio, or chat—fast, discreet, and trusted by thousands across Sri Lanka.
        </p>

        <p className="text-blac text-2xl font-semibold mt-4">
          Trusted by {count.toLocaleString()}+ Users for their sexual health
        </p>

        <a
          href="/login"
          className="inline-block mt-4 bg-[#5f6FFF] text-[#feedd6] font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform duration-300 border border-[#5f6FFF]"
        >
          Start Your Consultation
        </a>
      </div>

      {/* Right Side Dynamic Bubbles */}
      <div className="relative z-10 md:w-1/2 flex justify-center items-center">
        <div className="w-40 h-40 bg-[#5f6FFF]/30 rounded-full animate-bounce-slow"></div>
        <div className="w-32 h-32 bg-[#5f6FFF]/20 rounded-full absolute top-10 right-10 animate-spin-slow"></div>
        <div className="w-24 h-24 bg-[#5f6FFF]/25 rounded-full absolute bottom-10 left-10 animate-pulse-slow"></div>
      </div>

      {/* Custom Animations */}
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

          @keyframes spin-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          .animate-spin-reverse { animation: spin-reverse 30s linear infinite; }

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

export default Header;
