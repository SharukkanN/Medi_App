import { apiPost } from "../api/ApiManager";

export const createBooking = async (bookingData) => {
  return apiPost({
    path: "/bookings/create",
    requestBody: bookingData,
  });
};
