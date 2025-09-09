import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validation
    if (!isChecked) {
      setError("You must agree to the Privacy & Policy!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_username: username,
          user_email: email,
          user_password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create account');
        return;
      }

      console.log('User created:', data);

      // ✅ Navigate to /my-profile/:id after signup
      navigate('/signin');

    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form 
        className='min-h-[88vh] flex items-center justify-center'
        onSubmit={onSubmitHandler}
      >
        <div className='flex flex-col gap-4 items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
          <p className='text-2xl font-semibold'>Create Account</p>
          <p>Please create an account to book an appointment</p>

          <div className='w-full'>
            <p>Username</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className='w-full'>
            <p>Email</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className='w-full'>
            <p>Password</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className='w-full'>
            <p>Confirm Password</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 mt-1'
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <div className='flex items-center mt-2'>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-zinc-700 cursor-pointer">
              I agree to the{' '}
              <span 
                className='text-primary underline cursor-pointer'
                onClick={() => setShowPolicy(true)}
              >
                Privacy & Policy
              </span>
            </label>
          </div>

          {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}

          <button 
            type="submit"
            className='bg-primary text-white w-full py-2 rounded-md text-base mt-2'
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Already have an account */}
          <p className="text-sm text-zinc-600 mt-2">
            Already have an account?{' '}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </p>
        </div>
      </form>

      {/* Privacy & Policy Modal */}
      {showPolicy && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-xl max-w-md mx-4 shadow-lg relative'>
            <h2 className='text-xl font-bold mb-4 text-primary'>Privacy & Policy</h2>
            <p className='text-sm text-zinc-700'>
              Your privacy and security are our top priorities. All personal and medical information is encrypted and kept confidential. We ensure safe and secure consultations, protecting your data at every step.
            </p>
            <button
              onClick={() => setShowPolicy(false)}
              className='absolute top-3 right-3 text-zinc-500 hover:text-zinc-900 font-bold'
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;
