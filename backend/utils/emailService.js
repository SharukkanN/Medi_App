import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to strip HTML tags and create plain text
const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Remove extra newlines
    .trim();
};

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

    // Replace placeholders in HTML template
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
    });

    // Generate text version from HTML
    const textTemplate = stripHtml(htmlTemplate);

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

    // Replace placeholders in HTML template
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
    });

    // Generate text version from HTML
    const textTemplate = stripHtml(htmlTemplate);

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

// Function to send meeting link email to user
export const sendMeetingLinkEmailToUser = async (bookingData) => {
  try {
    // Read HTML template
    const htmlTemplatePath = path.join(__dirname, '../templates/meetingLinkToUser.html');
    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');

    // Replace placeholders in HTML template
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
      booking_link: bookingData.booking_link,
    };

    // Replace in HTML template
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlTemplate = htmlTemplate.replace(regex, replacements[key]);
    });

    // Generate text version from HTML
    const textTemplate = stripHtml(htmlTemplate);

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: bookingData.user_email,
      subject: 'Meeting Link for Your Online Consultation - MediPlus',
      text: textTemplate,
      html: htmlTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Meeting link email sent to user:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending meeting link email to user:', error);
    return { success: false, error: error.message };
  }
};

// Function to send meeting link email to doctor
export const sendMeetingLinkEmailToDoctor = async (bookingData, doctorData) => {
  try {
    // Read HTML template
    const htmlTemplatePath = path.join(__dirname, '../templates/meetingLinkToDoctor.html');
    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');

    // Replace placeholders in HTML template
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
      booking_link: bookingData.booking_link,
    };

    // Replace in HTML template
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlTemplate = htmlTemplate.replace(regex, replacements[key]);
    });

    // Generate text version from HTML
    const textTemplate = stripHtml(htmlTemplate);

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: doctorData.doctor_email,
      subject: 'Meeting Link for Online Consultation - MediPlus',
      text: textTemplate,
      html: htmlTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Meeting link email sent to doctor:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending meeting link email to doctor:', error);
    return { success: false, error: error.message };
  }
};

// Function to send admin booking notification email
export const sendAdminBookingNotificationEmail = async (bookingData) => {
  try {
    // Read HTML template
    const htmlTemplatePath = path.join(__dirname, '../templates/adminBookingNotification.html');
    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');

    // Replace placeholders in HTML template
    const replacements = {
      user_name: bookingData.user_name || 'Valued Customer',
      user_email: bookingData.user_email,
      user_mobile: bookingData.user_mobile,
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
    });

    // Generate text version from HTML
    const textTemplate = stripHtml(htmlTemplate);

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Booking Notification - MediPlus',
      text: textTemplate,
      html: htmlTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin booking notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin booking notification email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send prescription notification email
export const sendPrescriptionNotificationEmail = async (bookingData, prescriptionArray) => {
  try {
    // Read HTML template
    const htmlTemplatePath = path.join(__dirname, '../templates/prescriptionNotification.html');
    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');

    // Generate prescription download links
    let prescriptionLinks = '';
    if (Array.isArray(prescriptionArray)) {
      prescriptionArray.forEach((prescription, index) => {
        const downloadUrl = `${process.env.CLOUDINARY_BASE_URL}/${prescription}`;
        prescriptionLinks += `<p><a href="${downloadUrl}" class="download-btn" target="_blank">Download Prescription ${index + 1}</a></p>`;
      });
    }

    // Replace placeholders in HTML template
    const replacements = {
      user_name: bookingData.user_name || 'Valued Customer',
      prescription_links: prescriptionLinks,
    };

    // Replace in HTML template
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlTemplate = htmlTemplate.replace(regex, replacements[key]);
    });

    // Generate text version from HTML
    const textTemplate = stripHtml(htmlTemplate);

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: bookingData.user_email,
      subject: 'Your Prescription is Ready - MediPlus',
      text: textTemplate,
      html: htmlTemplate,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Prescription notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending prescription notification email:', error);
    return { success: false, error: error.message };
  }
};