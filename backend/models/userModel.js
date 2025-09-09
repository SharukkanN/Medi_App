import pool from "../config/db.js";

// Create user
export const createUser = async (user) => {
  const { user_username, user_email, user_password } = user;

  const sql = `
    INSERT INTO Users (user_username, user_email, user_password)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.query(sql, [user_username, user_email, user_password]);
  return result;
};

// Get all users
export const getUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM Users ORDER BY user_id DESC");
  return rows;
};

// Get single user
export const getUserById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM Users WHERE user_id = ?", [id]);
  return rows[0];
};

// Update user
export const updateUser = async (id, user) => {
  const { 
    user_username, 
    user_email, 
    user_password, 
    user_name, 
    user_age, 
    user_gender, 
    user_phone 
  } = user;

  const sql = `
    UPDATE Users SET 
      user_username = ?, 
      user_email = ?, 
      user_password = ?, 
      user_name = ?, 
      user_age = ?, 
      user_gender = ?, 
      user_phone = ?
    WHERE user_id = ?
  `;

  const [result] = await pool.query(sql, [
    user_username || null,
    user_email || null,
    user_password || null,
    user_name || null,
    user_age || null,
    user_gender || null,
    user_phone || null,
    id
  ]);

  return result;
};

// Delete user
export const deleteUser = async (id) => {
  const [result] = await pool.query("DELETE FROM Users WHERE user_id = ?", [id]);
  return result;
};


// Count all doctors (for dashboard)
export const countUsers = async () => {
  const [[{ count }]] = await pool.query("SELECT COUNT(*) AS count FROM users");
  return count;
};
