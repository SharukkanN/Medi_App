import * as Booking from "../models/bookingModel.js";

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
