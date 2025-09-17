import { apiGet, apiPut } from "../api/ApiManager";

export const getUserById = async (userId) => {
  return apiGet({
    path: `/users/${userId}`
  });       
};

export const updateUser = async (userId, userData) => {
  return apiPut({
    path: `/users/${userId}`,
    requestBody: userData
  });
};