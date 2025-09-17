import { apiGet, apiPost } from '../api/ApiManager';

export const validateToken = async () => {
  try {
    const response = await apiGet({ path: '/auth/validate' });
    return response.status >= 200 && response.status < 300;
  } catch (err) {
    console.error("Token validation failed:", err);
    return false;
  }
};

export const doctorLogin = async (username, password) => {
  try {
    const response = await apiPost({
      path: "/doctor/login",
      requestBody: {
        doctor_username: username,
        doctor_password: password,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Doctor login failed");
  }
};

export const userLogin = async (username, password) => {
  try {
    const response = await apiPost({
      path: "/auth/signin",
      requestBody: {
        user_username: username,
        user_password: password,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "User login failed");
  }
};