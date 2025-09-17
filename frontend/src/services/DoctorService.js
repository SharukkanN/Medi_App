import { apiGet, apiDelete } from "../api/ApiManager";

export const getDoctors = async () => {
  return apiGet({
    path: "/doctor",
  });       
};

export const getDoctorDetailsById = async (docId) => {
  return apiGet({
    path: `/doctor/${docId}`,
  });       
};

export const deleteDoctorById = async (docId) => {
  return apiDelete({
    path: `/doctor/${docId}`,
  });
};