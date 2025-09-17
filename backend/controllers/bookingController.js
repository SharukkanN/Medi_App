import * as Booking from "../models/bookingModel.js";
import * as User from "../models/userModel.js";
import * as Doctor from "../models/doctorModel.js";
import pool from "../config/db.js";
import { sendBookingConfirmationEmail, sendDoctorBookingNotificationEmail, sendAdminBookingNotificationEmail, sendMeetingLinkEmailToUser, sendMeetingLinkEmailToDoctor, sendPrescriptionNotificationEmail } from "../utils/emailService.js";
import fs from "fs";
import path from "path";

// ✅ Create booking
export const createBookingController = async (req, res) => {
  try {
    const {
      user_id,
      user_email,
      user_mobile,
      doctor_firstname,
      doctor_lastname,
      doctor_specialty,
      booking_date,
      booking_time,
      booking_fees,
      booking_status,
    } = req.body;

    // File handling
    let booking_receipt = req.files?.booking_receipt
      ? req.files.booking_receipt[0].filename
      : null;

    let booking_prescription = req.files?.booking_prescription
      ? req.files.booking_prescription.map((f) => f.filename).join(",")
      : null;

    let booking_user_doc = req.files?.booking_user_doc
      ? req.files.booking_user_doc.map((f) => f.filename).join(",")
      : null;

    const booking = await Booking.createBooking({
      user_id,
      user_email,
      user_mobile,
      doctor_firstname,
      doctor_lastname,
      doctor_specialty,
      booking_date,
      booking_time,
      booking_fees,
      booking_receipt,
      booking_prescription,
      booking_user_doc,
      booking_status: booking_status || "Pending",
    });

    // Get user details for email
    const user = await User.getUserById(user_id);

    // Get doctor details for email
    const doctor = await Doctor.getDoctorByNameAndSpecialty(doctor_firstname, doctor_lastname, doctor_specialty);

    // Send booking confirmation email to user
    const emailData = {
      ...booking,
      user_name: user?.user_name || 'Valued Customer',
    };

    // Send emails asynchronously (don't wait for them to complete)
    sendBookingConfirmationEmail(emailData).catch(err => {
      console.error('Failed to send booking confirmation email:', err);
    });

    // Send notification email to doctor if doctor exists
    if (doctor && doctor.doctor_email) {
      sendDoctorBookingNotificationEmail(emailData, doctor).catch(err => {
        console.error('Failed to send doctor booking notification email:', err);
      });
    }

    // Send notification email to admin
    sendAdminBookingNotificationEmail(emailData).catch(err => {
      console.error('Failed to send admin booking notification email:', err);
    });

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get bookings of a specific user
export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.params.userId;
    const bookings = await Booking.getBookingsByUser(user_id);
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all bookings (Admin)
export const getAllBookingsController = async (req, res) => {
  try {
    const bookings = await Booking.getAllBookings();
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update booking
export const updateBookingController = async (req, res) => {
  try {
    const booking_id = req.params.bookingId;
    const updateData = { ...req.body };

    // File handling
    if (req.files?.booking_receipt) {
      updateData.booking_receipt = req.files.booking_receipt[0].filename;
    }
    if (req.files?.booking_prescription) {
      updateData.booking_prescription = req.files.booking_prescription
        .map((f) => f.filename)
        .join(",");
    }
    if (req.files?.booking_user_doc) {
      updateData.booking_user_doc = req.files.booking_user_doc
        .map((f) => f.filename)
        .join(",");
    }

    const updated = await Booking.updateBooking(booking_id, updateData);
    if (!updated) return res.status(404).json({ message: "Booking not found" });

    // If status is being updated to "Link" and booking_link is provided, send notification emails
    if (updateData.booking_status === "Link" && updateData.booking_link) {
      // Get the updated booking details
      const [bookingRows] = await pool.query("SELECT * FROM bookings WHERE booking_id = ?", [booking_id]);
      const booking = bookingRows[0];

      if (booking) {
        // Get user details for email
        const user = await User.getUserById(booking.user_id);

        // Get doctor details for email
        const doctor = await Doctor.getDoctorByNameAndSpecialty(
          booking.doctor_firstname,
          booking.doctor_lastname,
          booking.doctor_specialty
        );

        const emailData = {
          ...booking,
          user_name: user?.user_name || 'Valued Customer',
        };

        // Send meeting link notification to user
        sendMeetingLinkEmailToUser(emailData).catch(err => {
          console.error('Failed to send meeting link email to user:', err);
        });

        // Send meeting link notification to doctor if doctor exists
        if (doctor && doctor.doctor_email) {
          sendMeetingLinkEmailToDoctor(emailData, doctor).catch(err => {
            console.error('Failed to send meeting link email to doctor:', err);
          });
        }
      }
    }

    res.json({ message: "Booking updated successfully" });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete booking
export const deleteBookingController = async (req, res) => {
  try {
    const booking_id = req.params.bookingId;
    const deleted = await Booking.deleteBooking(booking_id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Count all bookings (for dashboard)
export const getBookingsCount = async (req, res) => {
  try {
    const count = await Booking.countBookings();
    res.json({ count });
  } catch (err) {
    console.error("Error counting bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Booking stats by status
export const getBookingsStats = async (req, res) => {
  try {
    const stats = await Booking.getBookingStats();
    res.json(stats);
  } catch (err) {
    console.error("Error fetching booking stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add prescription to a booking
export const addPrescriptionController = async (req, res) => {
  try {
    const { BookingId, Prescription } = req.body;

    if (!BookingId || !Array.isArray(Prescription)) {
      return res.status(400).json({ message: "Invalid input. BookingId and Prescription array are required." });
    }

    const updated = await Booking.updatePrescription(BookingId, Prescription);
    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Get booking details to send email
    const bookingData = await Booking.getBookingById(BookingId);
    if (bookingData) {
      // Get user name from user table
      const userData = await User.getUserById(bookingData.user_id);
      const emailData = {
        user_name: userData ? userData.name : 'Valued Customer',
        user_email: bookingData.user_email,
      };

      // Send prescription notification email
      await sendPrescriptionNotificationEmail(emailData, Prescription);
    }

    res.json({ message: "Prescription added successfully" });
  } catch (err) {
    console.error("Error adding prescription:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add user documents to a booking
export const addUserDocumentsController = async (req, res) => {
  try {
    const { BookingId, Documents } = req.body;

    if (!BookingId || !Array.isArray(Documents)) {
      return res.status(400).json({ message: "Invalid input. BookingId and Documents array are required." });
    }

    const updated = await Booking.updateUserDocs(BookingId, Documents);
    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Documents added successfully" });
  } catch (err) {
    console.error("Error adding documents:", err);
    res.status(500).json({ message: "Server error" });
  }
};
