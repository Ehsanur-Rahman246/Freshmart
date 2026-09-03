import express from "express";
import {
  checkAuth,
  deleteUserByEmail,
  login,
  logout,
  register,
  resetPassword,
  sendResetPasswordOtp,
  sendVerificationOtp,
  verifyUser,
} from "../controllers/authControllers.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.delete("/deleteUser", deleteUserByEmail);
authRouter.post("/send-verification-otp", userAuth, sendVerificationOtp);
authRouter.post("/verify-account", userAuth, verifyUser);
authRouter.get("/check-auth", userAuth, checkAuth);
authRouter.post("/send-reset-otp", sendResetPasswordOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
