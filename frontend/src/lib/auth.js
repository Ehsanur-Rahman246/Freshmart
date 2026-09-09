import api from "./api";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const deleteAccount = (data) =>
  api.delete("/auth/delete-account", { data });
export const sendVerificationOtp = () =>
  api.post("/auth/send-verification-otp");
export const verifyAccount = (data) => api.post("/auth/verify-account", data);
export const checkAuth = () => api.get("/auth/check-auth");
export const sendResetOtp = (data) => api.post("/auth/send-reset-otp", data);
export const verifyResetPasswordOtp = (data) =>
  api.post("/auth/verify-reset-otp", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
