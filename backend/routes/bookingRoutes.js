// backend/routes/bookingRoutes.js
import express from "express";
import multer from "multer";
import {
  createBookingController,
  getUserBookings,
  updateBookingController,
  deleteBookingController,
  getAllBookingsController,
  getBookingsCount,
  getBookingsStats,
  addPrescriptionController,
} from "../controllers/bookingController.js";

const router = express.Router();

// ✅ Multer setup for user documents
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Upload/Booking/User"); // Folder for user documents
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const uploadUserDocs = multer({ storage: userStorage });

// ✅ Multer setup for doctor prescriptions
const doctorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Upload/Booking/Doctor"); // Folder for doctor prescriptions
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const uploadDoctorPrescriptions = multer({ storage: doctorStorage });

// ✅ Combine multiple fields
const multiUpload = multer().fields([
  { name: "booking_user_doc", maxCount: 10 },
  { name: "booking_prescription", maxCount: 10 },
]);

// ================= ROUTES ================= //

// 👉 Create new booking with user docs and doctor prescriptions
router.post("/create", multiUpload, createBookingController);

// 👉 Get all bookings of a specific user
router.get("/user/:userId", getUserBookings);

// 👉 Get all bookings (Admin)
router.get("/all", getAllBookingsController);

// 👉 Update booking with user docs and doctor prescriptions
router.put("/update/:bookingId", multiUpload, updateBookingController);

// 👉 Delete booking
router.delete("/delete/:bookingId", deleteBookingController);

// 👉 Dashboard routes (stats)
router.get("/count/all", getBookingsCount);
router.get("/stats", getBookingsStats);

// 👉 Add prescription to a booking
router.post("/add-prescription", addPrescriptionController);

export default router;
