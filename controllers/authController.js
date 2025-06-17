import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../services/emailService.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import axios from "axios";

const clientId = process.env.LINKEDIN_CLIENT_ID;
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

// ✅ Register New User & Send OTP
export const signupUser = async (req, res) => {
  // Renamed from registerUser
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already registered" });

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Create user (without verification)
    const user = await User.create({ name, email, password, otp, otpExpiry });

    // Send OTP via Email
    await sendEmail(email, "Verify Your Account", `Your OTP is: ${otp}`);

    res.status(201).json({
      message: "Signup successful! Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Verify Email OTP
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp || Date.now() > user.otpExpiry)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // valid for 10 minutes

    await user.save();

    const message = `Your OTP for email verification is: ${otp}\n\nIt will expire in 10 minutes.`;

    await sendEmail(email, "Resend Email Verification OTP", message);

    res.status(200).json({ message: "Verification OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// ✅ Login User & Generate JWT Token
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified)
      return res.status(400).json({ message: "Email not verified" });

    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(res, user._id);
    res.json({ message: "Login successful!", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Login with LinkedIn
export const linkedInAuth = (req, res) => {
  const response_type='code';
  const scope = 'openid profile email';

  const authURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=${response_type}&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}`;

  return res.redirect(authURL);
};

// LinkedIn Callback
export const linkedInCallback = async (req, res) => {
  console.log("Query params:", req.query);

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, id_token } = tokenRes.data;
    console.log("Access Token:", access_token);
    console.log("ID Token:", id_token);

    const decoded = jwt.decode(id_token);
    console.log("Decoded ID Token:", decoded);

    const email = decoded.email;
    const name = decoded.name || `${decoded.given_name || ""} ${decoded.family_name || ""}`.trim();

    if (!email) {
      return res.status(400).json({ message: "Email not found in ID token" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name,
        email: email,
        isVerified: true,
        password: Math.random().toString(36).slice(-8), 
      });
    }

    generateToken(res, user._id);

   
    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error("LinkedIn OAuth error:", err.message);
    res.status(500).json({
      message: "LinkedIn login failed",
      error: err.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    
    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Forgot Password (Send Reset Email)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.otp = resetToken;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // Valid for 10 min
    await user.save();

    // Send Reset Email
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

    console.log("RESET URL: ", resetUrl);    

    await sendEmail(
      email,
      "Reset Your Password",
      `Click here to reset: ${resetUrl}`
    );

    res.json({ message: "Password reset link sent!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      otp: token,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyResetToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token required" });
  }

  try {
    // Find a user whose otp matches and whose otpExpiry is still in the future
    const user = await User.findOne({
      otp: token,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // All good!
    return res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return res
      .status(500)
      .json({ message: "Server error while verifying token" });
  }
};

// ✅ Logout User
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "User logged out" });
};
