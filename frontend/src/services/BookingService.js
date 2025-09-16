import { apiPost, apiGet, apiPut, apiDelete } from "../api/ApiManager";

export const createBooking = async (bookingData) => {
  return apiPost({
    path: "/bookings/create",
    requestBody: bookingData,
  });
};

export const fetchAppointments = async () => {
  return apiGet({
    path: "/bookings/all",
  });
};

export const updateAppointment = async (bookingId, updateData) => {
  return apiPut({
    path: `/bookings/update/${bookingId}`,
    requestBody: updateData,
  });
};

export const deleteAppointment = async (bookingId) => {
  return apiDelete({
    path: `/bookings/delete/${bookingId}`,
  });
};

export const addPrescription = async (bookingId, prescription) => {
  return apiPost({
    path: "/bookings/add-prescription",
    requestBody: { BookingId: bookingId, Prescription: prescription },
  });
};
