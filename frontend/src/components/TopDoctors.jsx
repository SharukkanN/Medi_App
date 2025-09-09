// import React, { useContext } from 'react'

// import { useNavigate } from 'react-router-dom'
// import { AppContext } from '../context/AppContext'

// const TopDoctors = () => {

//     const navigate = useNavigate()
//     const {doctors} = useContext(AppContext)

//   return (
//     <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
//         <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
//         <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors</p>
//         <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
//             {doctors.slice(0,10).map((item,index)=>(
//                 <div onClick={()=>navigate(`/appointment/${item._id}`)} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
//                     <img className='bg-blue-50' src={item.image} alt="" />
//                     <div className='p-4'>
//                         <div className='flex items-center gap-2 text-sm text-center text-green-500'>
//                             <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
//                         </div>
//                         <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
//                         <p className='text-gray-600 text-sm'>{item.speciality}</p>
//                     </div>
//                 </div>
//               ))}
//         </div>
//         <button onClick={()=>{navigate('/doctors'); scrollTo(0,0)}} className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'>more</button>
//     </div>
//   )
// }

// export default TopDoctors




import React, { useState } from "react";

// --- Constants ---
const questions = [
  { id: 1, question: "Your Gender?", options: ["Male", "Female", "Other"] },
  { id: 2, question: "What is your main health concern?", options: ["Chest Pain", "Headache", "Stomach Issue", "Skin Problem", "Fever / General"] },
  { id: 3, question: "Is your condition severe?", options: ["Yes – urgent", "No – mild"] },
  { id: 4, question: "How long have you had these symptoms?", options: ["Less than 1 week", "1–4 weeks", "More than 1 month"] },
  { id: 5, question: "Do you have existing health conditions?", options: ["Diabetes", "Hypertension", "Heart Disease", "None"] },
  { id: 6, question: "Are you currently on any medications or treatments?", options: ["Yes", "No"] },
];

const doctorsData = [
  { name: "Dr. Arjun Kumar", exp: "20+ years experience", specialty: "Cardiologist", avatar: "https://i.ibb.co/L8Jm3c3/doctor-male-1.png" }, // Example avatars
  { name: "Dr. Saman Fernando", exp: "18+ years experience", specialty: "Cardiologist", avatar: "https://i.ibb.co/S7q512z/doctor-male-2.png" },
  { name: "Dr. Liyana de Silva", exp: "12+ years experience", specialty: "Dermatologist", avatar: "https://i.ibb.co/VMyhD1y/doctor-female-1.png" },
  { name: "Dr. Kamalasiri Gunaratne", exp: "25+ years experience", specialty: "Neurologist", avatar: "https://i.ibb.co/L8Jm3c3/doctor-male-1.png" },
  { name: "Dr. Priyantha Dissanayake", exp: "15+ years experience", specialty: "Gastroenterologist", avatar: "https://i.ibb.co/S7q512z/doctor-male-2.png" },
  { name: "Dr. Nimal Perera", exp: "15+ years experience", specialty: "General Physician", avatar: "https://i.ibb.co/L8Jm3c3/doctor-male-1.png" },
  { name: "Dr. Anusha Kumari", exp: "10+ years experience", specialty: "General Physician", avatar: "https://i.ibb.co/VMyhD1y/doctor-female-1.png" },
];

// --- Helper Functions ---
const mapToCategory = (answers) => {
  const problem = answers[2];
  const severity = answers[3];
  const conditions = answers[5];

  if (problem === "Chest Pain" && (severity === "Yes – urgent" || conditions === "Heart Disease")) return "Cardiologist";
  if (problem === "Headache") return "Neurologist";
  if (problem === "Stomach Issue") return "Gastroenterologist";
  if (problem === "Skin Problem") return "Dermatologist";
  
  return "General Physician"; // Default for all other cases
};

// --- QuestionStep Component ---
const QuestionStep = ({ question, answer, onSelect }) => (
  <div className="flex flex-col h-full justify-between animate-fade-in">
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-8 transition-all duration-300 ease-in-out">
        {question.question}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onSelect(option)}
            className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 ease-in-out transform hover:scale-105
              ${answer === option
                ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white border-blue-600 shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// --- Main SpecialityMenu Component ---
const TopDoctors = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  
  const handleSelect = (answer) => {
    setAnswers((prev) => ({ ...prev, [questions[step].id]: answer }));
  };

  const nextStep = () => {
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const recommendedSpecialty = completed ? mapToCategory(answers) : null;
  const filteredDoctors = recommendedSpecialty ? doctorsData.filter(doc => doc.specialty === recommendedSpecialty) : [];

  const progressPercentage = ((step + 1) / questions.length) * 100;
  
  return (
    <div className="min-h-screen p-6 font-sans bg-gradient-to-br from-blue-50 to-teal-100 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-600 drop-shadow-md">
            MediPlus Lanka – Find Your Specialist
          </h1>
          <p className="text-gray-700 mt-3 text-lg italic">
            Your personalized guide to expert medical care.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Box – Questions */}
          <div className="lg:w-1/2 min-h-[550px] bg-white border border-blue-100 rounded-3xl p-10 flex flex-col justify-between shadow-xl transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] ease-in-out">
            {!completed ? (
              <>
                <QuestionStep
                  question={questions[step]}
                  answer={answers[questions[step].id]}
                  onSelect={handleSelect}
                />
                <div className="mt-8">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-teal-400 h-2.5 rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setStep(step - 1)}
                      disabled={step === 0}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 disabled:text-gray-400 disabled:border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    >
                      <i className="fas fa-arrow-left mr-2"></i> Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!answers[questions[step].id]}
                      className="px-8 py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-teal-500 disabled:bg-gradient-to-r disabled:from-blue-300 disabled:to-teal-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {step + 1 === questions.length ? "Confirm & Find Doctor" : "Next Question "} 
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center flex flex-col justify-center h-full animate-fade-in">
                <div className="text-6xl mb-6 animate-bounce-in">🎉</div>
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Thank you for sharing, Ayubowan!</h2>
                <p className="text-gray-700 mb-6 text-xl">
                  We've gathered your details and are ready to connect you with the best medical care.
                </p>
                <button
                  onClick={() => { setStep(0); setAnswers({}); setCompleted(false); }}
                  className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Start a New Consultation
                </button>
              </div>
            )}
          </div>

          {/* Right Box – Results */}
          <div className="lg:w-1/2 min-h-[550px] bg-white border border-blue-100 rounded-3xl p-10 shadow-xl overflow-y-auto transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] ease-in-out">
            {completed ? (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 pb-3 border-blue-100">
                  Your Recommended Specialty 🌟
                </h2>
                <p className="text-blue-700 font-extrabold text-3xl mb-8">
                  {recommendedSpecialty}
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-5">Available Doctors:</h3>
                <div className="space-y-5">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc, i) => (
                      <div key={i} className="flex items-center p-5 border border-gray-200 rounded-xl bg-gradient-to-r from-white to-blue-50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 transform hover:-translate-y-1">
                        <img 
                            src={doc.avatar} // Use actual avatar
                            alt={doc.name} 
                            className="w-16 h-16 rounded-full mr-4 border-2 border-blue-300 object-cover"
                        />
                        <div>
                          <p className="font-bold text-lg text-blue-700">{doc.name}</p>
                          <p className="text-gray-600 text-sm">{doc.exp}</p>
                          <p className="text-blue-500 text-xs font-medium mt-1">{doc.specialty}</p>
                        </div>
                        <button className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm shadow-md">
                            Book Now
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600 text-center mt-12 p-8 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
                      <p className="text-xl mb-4">😔</p>
                      <p>No doctors currently available for this specialty.</p>
                      <p className="mt-2">Please try again later or contact our support for assistance.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center mt-24 p-8 animate-fade-in">
                <p className="text-5xl mb-6">👆</p>
                <p className="text-xl font-medium">Answer the questions on the left</p>
                <p className="text-lg mt-2">to unveil your personalized doctor recommendation here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDoctors;