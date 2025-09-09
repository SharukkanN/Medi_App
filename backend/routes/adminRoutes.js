import express from "express";
import { getAllDoctors } from "../models/doctorModel.js";
import { getUsers } from "../models/userModel.js";
import { getBookingsByUser } from "../models/bookingModel.js"; // optional, we'll count all bookings

const router = express.Router();

// GET counts for dashboard
router.get("/counts", async (req, res) => {
  try {
    const doctors = (await getAllDoctors()).length;
    const users = (await getUsers()).length;

    // To count all bookings/appointments
    const [bookingsRows] = await db.query("SELECT COUNT(*) AS appointments FROM bookings");
    const appointments = bookingsRows[0].appointments;

    // Alternatively, if you want to fetch per user:
    // const appointments = (await getBookingsByUser(user_id)).length;

    res.json({ doctors, users, appointments });
  } catch (err) {
    console.error("Error fetching counts:", err);
    res.status(500).json({ message: "Error fetching counts" });
  }
});

export default router;
