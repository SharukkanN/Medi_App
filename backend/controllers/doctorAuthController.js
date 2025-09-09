// controllers/doctorAuthController.js
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// --- Doctor Sign In ---
export const doctorSignIn = async (req, res) => {
  const { doctor_username, doctor_password } = req.body;

  if (!doctor_username || !doctor_password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM doctors WHERE doctor_username = ? AND doctor_password = ?",
      [doctor_username, doctor_password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const doctor = rows[0];

    // Generate JWT
    const token = jwt.sign({ doctor_id: doctor.doctor_id, role: "doctor" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", doctor, token });
  } catch (err) {
    console.error("Doctor SignIn error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
