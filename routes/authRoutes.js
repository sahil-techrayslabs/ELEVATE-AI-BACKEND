import express from "express";
import {
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logoutUser,
  checkAuth,
  signupUser,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User Registration with OTP Verification
router.post("/signup", signupUser);

// Email OTP Verification
router.post("/verify-email", verifyEmail);

// User Login (JWT Authentication)
router.post("/login", loginUser);
// Route to check if the user is authenticated
router.get("/check-auth", checkAuth);
// Forgot Password (Send Reset Email)
router.post("/forgot-password", forgotPassword);

// Reset Password (Update new password)
router.post("/reset-password", resetPassword);

// Logout User (Clear Cookie)
router.post("/logout", logoutUser);

// Protected Route Example
router.get("/protected", protect, (req, res) => {
  res.json({ message: "This is a protected route!" });
});

export default router;
