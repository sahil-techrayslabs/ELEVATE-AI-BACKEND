import express from "express";
import { getUserDashboard } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected route: Only accessible if user is logged in
router.get("/", protect, getUserDashboard);

export default router;
