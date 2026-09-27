import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "/api");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || "";
    const isExemptRequest =
      url.includes("/auth/login") || url.includes("/auth/check-auth");
    const alreadyOnLogin = window.location.pathname === "/login";

    if (
      !isExemptRequest &&
      !alreadyOnLogin &&
      error?.response?.status === 403 &&
      error?.response?.data?.message === "This account has been disabled"
    ) {
      toast.error("Your account has been disabled.");
      sessionStorage.setItem("accountDisabledRedirect", "1");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);

// One place for "what do I show the user" (use in toasts / error states)
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request)
    return "Cannot connect to server. Please check your connection.";
  return fallback;
};

export default api;
