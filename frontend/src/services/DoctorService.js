import { apiGet, apiDelete, apiPut, apiPost } from "../api/ApiManager";

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

export const updateDoctorById = async (docId, doctorData) => {
  return apiPut({
    path: `/doctor/${docId}`,
    requestBody: doctorData
  });
};

export const createDoctor = async (doctorData) => {
  return apiPost({
    path: `/doctor`,
    requestBody: doctorData
  });
};
