import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    if (type === 'Consultant Needs') {
      navigate('/patient/questions');
    } else if (type === 'General Checkup') {
      navigate('/checkup/packages');
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center">
      <div className="flex flex-col gap-6 items-center p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Which type of user are you?</p>
        <p>Please select one option to continue</p>

        <div className="flex flex-col gap-4 w-full mt-4">

          <button
            onClick={() => handleSelect('Consultant Needs')}
            className="bg-primary text-white w-full py-3 rounded-md text-base font-medium hover:bg-primary/90 transition"
          >
            Consultant Needs
          </button>
          <button
            onClick={() => handleSelect('General Checkup')}
            className="bg-primary text-white w-full py-3 rounded-md text-base font-medium hover:bg-primary/90 transition"
          >
            General Checkup
          </button>

          
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
