import { apiGet } from "../api/ApiManager";

export const getUserById = async (userId) => {
  return apiGet({
    path: `/users/${userId}`
  });       
};