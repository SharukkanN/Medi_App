import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// --- Sign In ---
export const signIn = async (req, res) => {
  const { user_username, user_password } = req.body;

  if (!user_username || !user_password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Find user
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE user_username = ?",
      [user_username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(user_password, user.user_password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT
    const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Remove password before sending response
    const { user_password: ignored, ...userData } = user;

    res.json({ message: "Login successful", user: userData, token });
  } catch (err) {
    console.error("SignIn error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Validate Token ---
export const validateToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user_id: decoded.user_id });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
