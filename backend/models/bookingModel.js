import pool from "../config/db.js";

// ✅ Create a new booking
export const createBooking = async (bookingData) => {
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
    booking_receipt,
    booking_prescription,
    booking_user_doc,
    booking_status,
    booking_link,
  } = bookingData;

  const [result] = await pool.query(
    `INSERT INTO bookings
      (user_id, user_email, user_mobile, doctor_firstname, doctor_lastname, doctor_specialty, 
       booking_date, booking_time, booking_fees, booking_receipt, 
       booking_prescription, booking_user_doc, booking_status, booking_link)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      user_email,
      user_mobile,
      doctor_firstname,
      doctor_lastname,
      doctor_specialty,
      booking_date,
      booking_time,
      booking_fees,
      booking_receipt || null,
      booking_prescription || null,
      booking_user_doc || null,
      booking_status || "Pending",
      booking_link || null,
    ]
  );

  return { booking_id: result.insertId, ...bookingData };
};

// ✅ Get all bookings for a specific user
export const getBookingsByUser = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM bookings WHERE user_id=? ORDER BY booking_id DESC",
    [user_id]
  );
  return rows;
};

// ✅ Get all bookings (Admin)
export const getAllBookings = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM bookings ORDER BY booking_id DESC"
  );
  return rows;
};

// ✅ Update booking
export const updateBooking = async (booking_id, bookingData) => {
  const [result] = await pool.query(
    "UPDATE bookings SET ? WHERE booking_id=?",
    [bookingData, booking_id]
  );
  return result.affectedRows;
};

// ✅ Delete booking
export const deleteBooking = async (booking_id) => {
  const [result] = await pool.query(
    "DELETE FROM bookings WHERE booking_id=?",
    [booking_id]
  );
  return result.affectedRows;
};

// ✅ Count total bookings
export const countBookings = async () => {
  const [[{ count }]] = await pool.query(
    "SELECT COUNT(*) AS count FROM bookings"
  );
  return count;
};

// ✅ Booking stats by status (Pending, Processing, Confirmed, Link)
export const getBookingStats = async () => {
  const [rows] = await pool.query(
    `SELECT booking_status, COUNT(*) AS total 
     FROM bookings 
     GROUP BY booking_status`
  );
  return rows;
};

// ✅ Get booking by ID
export const getBookingById = async (booking_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM bookings WHERE booking_id = ?",
    [booking_id]
  );
  return rows[0];
};

// ✅ Update prescription for a booking
export const updatePrescription = async (booking_id, prescription) => {
  const [result] = await pool.query(
    "UPDATE bookings SET booking_prescription = ? WHERE booking_id = ?",
    [JSON.stringify(prescription), booking_id]
  );
  return result.affectedRows;
};

// ✅ Update user documents for a booking
export const updateUserDocs = async (booking_id, documents) => {
  const [result] = await pool.query(
    "UPDATE bookings SET booking_user_doc = ? WHERE booking_id = ?",
    [documents.join(","), booking_id]
  );
  return result.affectedRows;
};
