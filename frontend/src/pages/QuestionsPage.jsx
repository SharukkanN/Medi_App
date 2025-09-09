import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Questions
const questions = [
  { id: 1, question: "What is your gender?", options: ["Male", "Female", "Other / Prefer not to say"] },
  { id: 2, question: "What is your age group?", options: ["Under 18 (⚠ Safety note: show hospital message, stop here)", "18–30", "31–50", "51+"] },
  { id: 3, question: "What is your main concern today?", options: ["General health check-up", "Problems with sexual performance", "Pain or discomfort during sex", "Possible infection (discharge, sores, itching, burning, unusual smell)", "Fertility or pregnancy-related issues", "Emotional or psychological concerns"] },
  { id: 4, question: "How long have you been experiencing this issue?", options: ["Less than 1 month", "1–6 months", "6–12 months", "More than 1 year"] },
  { id: 5, question: "Do you experience pain or discomfort in your genitals during sex?", options: ["Yes, regularly", "Sometimes", "No"] },
  { id: 6, question: "Do you experience difficulty getting or keeping an erection (for men) / arousal issues (for women)?", options: ["Yes, often", "Sometimes", "No"] },
  { id: 7, question: "Are you worried about an infection (STD)?", options: ["Yes (burning, discharge, sores, itching, unusual smell)", "Not sure", "No"] },
  { id: 8, question: "Are you trying to conceive but facing difficulties?", options: ["Yes, more than 6 months", "Yes, less than 6 months", "No"] },
  { id: 9, question: "Do stress, anxiety, or relationship problems affect your sex life?", options: ["Yes, a lot", "Sometimes", "No"] },
  { id: 10, question: "What is your preferred treatment approach?", options: [ "Western" , "Ayurvedic"] },
];

// Short explanations for each specialty
const specialtyDescriptions = {
  GP: "General Physicians handle overall health check-ups and guide you to the right specialist when needed.",
  Urologist: "Urologists specialize in urinary and male reproductive health, including sexual performance concerns.",
  Gynecologist: "Gynecologists focus on women’s reproductive and sexual health.",
  Venereologist: "Venereologists treat sexually transmitted infections (STDs) and related conditions.",
  Fertility: "Fertility specialists help couples and individuals with conception difficulties and pregnancy care.",
  Psychologist: "Psychologists support emotional and mental health, helping you with stress, anxiety, and relationship concerns.",
  Ayurvedic: "Ayurvedic doctors use natural, traditional methods for holistic healing.",
};

const QuestionsPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState([]);
  const [doctorProfiles, setDoctorProfiles] = useState([]);
  const navigate = useNavigate();

  const handleSelect = (option) => {
    setAnswers({ ...answers, [questions[currentStep].id]: option });
  };

  const handleNext = () => {
    if (currentStep === 1 && answers[2] === questions[1].options[0]) {
      alert("⚠ Patients under 18 should consult a hospital directly. Process stopped.");
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const doctorsList = calculateDoctors();
      setSuggestedDoctors(doctorsList);
      setFinished(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const calculateDoctors = () => {
    const selectedDoctors = new Set();
    const gender = answers[1];
    const concern = answers[3];
    const pain = answers[5];
    const erection = answers[6];
    const infection = answers[7];
    const fertility = answers[8];
    const stress = answers[9];
    const ayurvedic = answers[10];

    if (ayurvedic === "Ayurvedic") return ["Ayurvedic"];

    if (concern === "General health check-up") selectedDoctors.add("GP");
    if (concern === "Problems with sexual performance") selectedDoctors.add("Urologist");
    if (concern === "Pain or discomfort during sex") selectedDoctors.add(gender === "Female" ? "Gynecologist" : "Urologist");
    if (concern === "Possible infection (discharge, sores, itching, burning, unusual smell)") selectedDoctors.add("Venereologist");
    if (concern === "Fertility or pregnancy-related issues") selectedDoctors.add("Fertility");
    if (concern === "Emotional or psychological concerns") selectedDoctors.add("Psychologist");

    if (pain === "Yes, regularly" || pain === "Sometimes") selectedDoctors.add(gender === "Female" ? "Gynecologist" : "Urologist");
    if (erection === "Yes, often" || erection === "Sometimes") selectedDoctors.add("Urologist");
    if (infection === "Yes (burning, discharge, sores, itching, unusual smell)" || infection === "Not sure") selectedDoctors.add("Venereologist");
    if (fertility === "Yes, more than 6 months") selectedDoctors.add("Fertility");
    if (fertility === "Yes, less than 6 months") selectedDoctors.add(gender === "Female" ? "Gynecologist" : "Urologist");
    if (stress === "Yes, a lot" || stress === "Sometimes") selectedDoctors.add("Psychologist");

    return Array.from(selectedDoctors);
  };

  useEffect(() => {
    if (finished && suggestedDoctors.length > 0) {
      fetch("http://localhost:4000/api/doctor")
        .then((res) => res.json())
        .then((data) => {
          const matched = data.filter((doc) =>
            suggestedDoctors.includes(doc.doctor_specialty)
          );
          setDoctorProfiles(matched);
        })
        .catch((err) => console.error("Error fetching doctors:", err));
    }
  }, [finished, suggestedDoctors]);

  if (finished) {
    return (
      <div className="min-h-[88vh] flex flex-col items-center justify-center p-6 gap-6">
        <h2 className="text-2xl font-semibold">Summary</h2>
        <p className="text-lg text-center max-w-2xl">
          Thank you for sharing your responses with us 💙.  
          Based on your answers, here are the best specialists for you:
        </p>

        <div className="w-full max-w-4xl flex flex-col gap-8 mt-6">
          {suggestedDoctors.map((specialty) => (
            <div key={specialty} className="border rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-primary mb-2">{specialty}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {specialtyDescriptions[specialty] || "Specialist doctors in this field can help you."}
              </p>

              <div className="flex flex-wrap gap-6">
                {doctorProfiles
                  .filter((doc) => doc.doctor_specialty === specialty)
                  .map((doc) => (
                    <div
                      key={doc.doctor_id}
                      className="flex items-center gap-3 border p-3 rounded-full shadow-sm bg-white"
                    >
                      <img
                        src={`http://localhost:4000/uploads/${doc.doctor_image}`}
                        alt={doc.doctor_firstname}
                        className="w-16 h-16 object-cover rounded-full border"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          Dr. {doc.doctor_firstname} {doc.doctor_lastname}
                        </span>
                        <button
                          onClick={() => navigate(`/appointment/${doc.doctor_id}`)}
                          className="mt-1 text-sm bg-primary text-white px-3 py-1 rounded-md"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] flex items-center justify-center">
      <div className="flex flex-col gap-6 p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">{questions[currentStep].question}</p>

        <div className="flex flex-col gap-3 mt-4">
          {questions[currentStep].options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              className={`w-full py-2 rounded-md border text-left px-4 transition ${
                answers[questions[currentStep].id] === option
                  ? "bg-primary text-white border-primary"
                  : "border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="bg-zinc-300 text-zinc-700 py-2 px-4 rounded-md disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="bg-primary text-white py-2 px-4 rounded-md"
          >
            {currentStep === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
