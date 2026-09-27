import express from "express";
import {
  checkAuth,
  deleteAccount,
  login,
  logout,
  register,
  resetPassword,
  sendResetPasswordOtp,
  sendVerificationOtp,
  updateProfile,
  verifyResetPasswordOtp,
  verifyUser,
} from "../controllers/authControllers.js";
import userAuth from "../middlewares/userAuth.js";
import {
  authRateLimit,
  loginRateLimit,
  otpSendRateLimit,
  otpVerifyRateLimit,
} from "../middlewares/rateLimit.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", authRateLimit, register);
authRouter.post("/login", loginRateLimit, login);
authRouter.delete("/delete-account", userAuth, authRateLimit, deleteAccount);
authRouter.post("/logout", logout);
authRouter.patch("/update-profile", userAuth, updateProfile);
authRouter.get("/check-auth", userAuth, checkAuth);
authRouter.post(
  "/send-verification-otp",
  userAuth,
  otpSendRateLimit,
  sendVerificationOtp,
);
authRouter.post("/verify-account", userAuth, otpVerifyRateLimit, verifyUser);
authRouter.post("/send-reset-otp", otpSendRateLimit, sendResetPasswordOtp);
authRouter.post(
  "/verify-reset-otp",
  otpVerifyRateLimit,
  verifyResetPasswordOtp,
);
authRouter.post("/reset-password", authRateLimit, resetPassword);

export default authRouter;
