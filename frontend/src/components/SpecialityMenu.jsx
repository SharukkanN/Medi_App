import React from "react";
import { useNavigate } from "react-router-dom";

const SpecialityMenu = () => {
  const navigate = useNavigate();

  const articles = [
    { title: "Understanding Sexual Health", image: "https://images.unsplash.com/photo-1588776814546-6cba5be4b0a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { title: "Safe Contraception Methods", image: "https://images.unsplash.com/photo-1601094172608-9b44f3b20f37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { title: "Common STIs & Prevention", image: "https://images.unsplash.com/photo-1603354350841-cc106d1fc7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { title: "Maintaining Intimacy & Mental Health", image: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { title: "Healthy Relationships", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { title: "STD Testing Guide", image: "https://images.unsplash.com/photo-1600195077072-c4e9128f6b43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { title: "Sexual Wellness Tips", image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { title: "Confidential Consultation Options", image: "https://images.unsplash.com/photo-1531219432768-75bb7d5a243d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  ];

  return (
    <div className="py-16 px-4 md:px-10 bg-white text-gray-800">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#5f6FFF]">
          Sexual Health Articles
        </h1>
        <p className="text-gray-700 mt-4 text-sm sm:text-base leading-relaxed">
          Explore helpful articles written by our healthcare experts to guide you on safe practices, awareness, and overall sexual wellbeing.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {articles.map((article, index) => (
          <div
            key={index}
            className="relative bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-lg hover:scale-105"
          >
            <div className="relative">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-t-2xl"></div>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-medium text-black text-base sm:text-lg">
                {article.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* More Button */}
      <div className="text-center">
        <button
          onClick={() => navigate("/artical")}
          className="bg-[#5f6FFF] text-white px-6 py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-[#4e56e0] transition-colors shadow-md"
        >
          More Articles
        </button>
      </div>
    </div>
  );
};

export default SpecialityMenu;
