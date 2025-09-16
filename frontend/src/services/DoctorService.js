import { apiGet } from "../api/ApiManager";

export const getDoctors = async () => {
  return apiGet({
    path: "/doctor",
  });       
};