import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorLogin, userLogin } from "../services/AuthService";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // --- Admin Login ---
      if (username === "admin_medi_plus" && password === "admin@123") {
        navigate("/admin/dashboard");
        return;
      }

      // --- Doctor Login ---
      try {
        const doctorData = await doctorLogin(username, password);

        localStorage.setItem("doctor", JSON.stringify(doctorData.doctor));
        localStorage.setItem("token", doctorData.token);

        // Update app state immediately
        window.dispatchEvent(new Event("storage"));

        navigate(`/doctor-panel/${doctorData.doctor.doctor_id}/profile`);
        return;
      } catch {
        // If doctor login fails, continue to user login
      }

      // --- Normal User Login ---
      try {
        const userData = await userLogin(username, password);

        localStorage.setItem("user", JSON.stringify(userData.user));
        localStorage.setItem("token", userData.token);

        window.dispatchEvent(new Event("storage"));

        navigate(`/my-profile/${userData.user.user_id}`);
      } catch (err) {
        setError(err.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="min-h-[88vh] flex items-center justify-center"
      onSubmit={onSubmitHandler}
    >
      <div className="flex flex-col gap-4 items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Sign In</p>
        <p>Please enter your username and password</p>

        <div className="w-full">
          <p>Username</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base mt-2"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </div>
    </form>
  );
};

export default SignIn;
