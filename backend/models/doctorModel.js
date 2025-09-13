// models/doctorModel.js
import pool from "../config/db.js";

// Get all doctors
export const getAllDoctors = async () => {
  const [rows] = await pool.query("SELECT * FROM doctors");
  return rows;
};

// Get doctor by ID
export const getDoctorById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM doctors WHERE doctor_id = ?", [id]);
  return rows[0];
};

// Get doctor by name and specialty
export const getDoctorByNameAndSpecialty = async (firstname, lastname, specialty) => {
  const [rows] = await pool.query(
    "SELECT * FROM doctors WHERE doctor_firstname = ? AND doctor_lastname = ? AND doctor_specialty = ?",
    [firstname, lastname, specialty]
  );
  return rows[0];
};

// Create doctor
export const createDoctor = async (doctorData) => {
  const {
    doctor_username,
    doctor_password,
    doctor_firstname,
    doctor_lastname,
    doctor_specialty,
    doctor_experience,
    doctor_bio,
    doctor_image,
    doctor_email,
    doctor_mobile,
    doctor_available_time,
    doctor_available_date,
    doctor_fees, // ✅ added new field
  } = doctorData;

  const [result] = await pool.query(
    `INSERT INTO doctors 
    (doctor_username, doctor_password, doctor_firstname, doctor_lastname, doctor_specialty, doctor_experience, doctor_bio, doctor_image, doctor_email, doctor_mobile, doctor_available_time, doctor_available_date, doctor_fees) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      doctor_username,
      doctor_password,
      doctor_firstname,
      doctor_lastname,
      doctor_specialty,
      doctor_experience,
      doctor_bio,
      doctor_image,
      doctor_email,
      doctor_mobile,
      doctor_available_time,
      doctor_available_date,
      doctor_fees, // ✅ include fees in insert
    ]
  );

  return { doctor_id: result.insertId, ...doctorData };
};

// Update doctor
export const updateDoctor = async (id, doctorData) => {
  const [result] = await pool.query("UPDATE doctors SET ? WHERE doctor_id = ?", [doctorData, id]);
  return result.affectedRows;
};

// Delete doctor
export const deleteDoctor = async (id) => {
  const [result] = await pool.query("DELETE FROM doctors WHERE doctor_id = ?", [id]);
  return result.affectedRows;
};


// Count all doctors (for dashboard)
export const countDoctors = async () => {
  const [[{ count }]] = await pool.query("SELECT COUNT(*) AS count FROM doctors");
  return count;
};