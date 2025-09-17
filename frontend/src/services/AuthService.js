import { apiGet } from '../api/ApiManager';

export const validateToken = async () => {
  try {
    const response = await apiGet({ path: '/auth/validate' });
    return response.status >= 200 && response.status < 300;
  } catch (err) {
    console.error("Token validation failed:", err);
    return false;
  }
};