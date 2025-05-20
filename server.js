import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js"; // Database Connection
import authRoutes from "./routes/authRoutes.js"; // Authentication Routes
import aiRoutes from "./routes/aiRoutes.js"; // AI Features
import calendarRoutes from "./routes/calendarRoutes.js"; // Calendar Routes

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware
app.use(express.json()); // Parses JSON
app.use(cookieParser()); // Enables cookies for auth
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Frontend URL from .env
    credentials: true, // Allow cookies & authentication headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS for preflight
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Extended headers
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes); // Authentication Routes
app.use("/api/ai", aiRoutes); // AI Features
app.use("/api/calendar", calendarRoutes); // Calendar Routes

// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
