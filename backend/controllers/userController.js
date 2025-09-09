import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  countUsers
} from "../models/userModel.js";
import bcrypt from "bcryptjs";

// Create user
export const addUser = async (req, res) => {
  try {
    const userData = { ...req.body };

    // Hash password before saving
    if (userData.user_password) {
      userData.user_password = await bcrypt.hash(userData.user_password, 10);
    }

    const result = await createUser(userData);
    res.status(201).json({ message: "User created", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users
export const fetchUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single user
export const fetchUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
export const editUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const existingUser = await getUserById(userId);
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const updatedData = { ...req.body };
    if (updatedData.user_password) {
      updatedData.user_password = await bcrypt.hash(updatedData.user_password, 10);
    }

    await updateUser(userId, updatedData);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
export const removeUser = async (req, res) => {
  try {
    const result = await deleteUser(req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Count users (for dashboard)
export const getUsersCount = async (req, res) => {
  try {
    const count = await countUsers(); // ✅ correct function call
    res.json({ count });
  } catch (err) {
    console.error("Error counting users:", err);
    res.status(500).json({ message: "Server error" });
  }
};
