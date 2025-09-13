import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send booking confirmation email
export const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    // Read HTML template
    const htmlTemplatePath = path.join(__dirname, '../templates/bookingConfirmation.html');
    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');

    // Read text template
    const textTemplatePath = path.join(__dirname, '../templates/bookingConfirmation.txt');
    let textTemplate = fs.readFileSync(textTemplatePath, 'utf8');

    // Replace placeholders in templates
    const replacements = {
      user_name: bookingData.user_name || 'Valued Customer',
      doctor_firstname: bookingData.doctor_firstname,
      doctor_lastname: bookingData.doctor_lastname,
      doctor_specialty: bookingData.doctor_specialty,
      booking_date: bookingData.booking_date,
      booking_time: bookingData.booking_time,
      booking_fees: bookingData.booking_fees,
      booking_status: bookingData.booking_status,
      booking_id: bookingData.booking_id,
    };

    // Replace in HTML template
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlTemplate = htmlTemplate.replace(regex, replacements[key]);
      textTemplate = textTemplate.replace(regex, replacements[key]);
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: bookingData.user_email,
      subject: 'Booking Confirmation - MediPlus',
      text: textTemplate,
      html: htmlTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send doctor booking notification email
export const sendDoctorBookingNotificationEmail = async (bookingData, doctorData) => {
  try {
    // Read HTML template
    const htmlTemplatePath = path.join(__dirname, '../templates/doctorBookingNotification.html');
    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');

    // Read text template
    const textTemplatePath = path.join(__dirname, '../templates/doctorBookingNotification.txt');
    let textTemplate = fs.readFileSync(textTemplatePath, 'utf8');

    // Replace placeholders in templates
    const replacements = {
      user_name: bookingData.user_name || 'Valued Customer',
      user_email: bookingData.user_email,
      user_mobile: bookingData.user_mobile,
      doctor_firstname: doctorData.doctor_firstname,
      doctor_lastname: doctorData.doctor_lastname,
      doctor_specialty: doctorData.doctor_specialty,
      booking_date: bookingData.booking_date,
      booking_time: bookingData.booking_time,
      booking_fees: bookingData.booking_fees,
      booking_status: bookingData.booking_status,
      booking_id: bookingData.booking_id,
    };

    // Replace in HTML template
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlTemplate = htmlTemplate.replace(regex, replacements[key]);
      textTemplate = textTemplate.replace(regex, replacements[key]);
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: doctorData.doctor_email,
      subject: 'New Appointment Booking - MediPlus',
      text: textTemplate,
      html: htmlTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Doctor booking notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending doctor booking notification email:', error);
    return { success: false, error: error.message };
  }
};