import express from "express";
import pool from "../config/db.js";
import { getAllDoctors } from "../models/doctorModel.js";
import { getUsers } from "../models/userModel.js";
import { getBookingsByUser, getAllBookings, updateBooking } from "../models/bookingModel.js";
import { updateBookingController } from "../controllers/bookingController.js";

const router = express.Router();

// GET counts for dashboard
router.get("/counts", async (req, res) => {
  try {
    const doctors = (await getAllDoctors()).length;
    const users = (await getUsers()).length;

    // To count all bookings/appointments
    const [bookingsRows] = await pool.query("SELECT COUNT(*) AS appointments FROM bookings");
    const appointments = bookingsRows[0].appointments;

    // Alternatively, if you want to fetch per user:
    // const appointments = (await getBookingsByUser(user_id)).length;

    res.json({ doctors, users, appointments });
  } catch (err) {
    console.error("Error fetching counts:", err);
    res.status(500).json({ message: "Error fetching counts" });
  }
});

// GET all bookings for admin
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE booking status and link (Admin only)
router.put("/bookings/:bookingId", updateBookingController);

export default router;
