// controllers/doctorController.js
import * as Doctor from "../models/doctorModel.js";

// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.getAllDoctors();
    res.json(doctors);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get doctor by ID
export const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create doctor
export const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.createDoctor(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    console.error("Error creating doctor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const rows = await Doctor.updateDoctor(req.params.id, req.body);
    if (rows === 0) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor updated" });
  } catch (err) {
    console.error("Error updating doctor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const rows = await Doctor.deleteDoctor(req.params.id);
    if (rows === 0) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    console.error("Error deleting doctor:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Count doctors (for dashboard)
export const getDoctorCount = async (req, res) => {
  try {
    const count = await Doctor.countDoctors();
    res.json({ count });
  } catch (err) {
    console.error("Error counting doctors:", err);
    res.status(500).json({ message: "Server error" });
  }
};
