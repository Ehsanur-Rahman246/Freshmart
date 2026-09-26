import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// One place for "what do I show the user" (use in toasts / error states)
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request) return "Cannot connect to server. Please check your connection.";
  return fallback;
};

export default api;