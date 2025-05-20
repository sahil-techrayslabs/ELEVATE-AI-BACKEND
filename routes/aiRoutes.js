import express from "express";
import {
  generateHashtags,
  generateCaption,
  generateComment,
  getContentSuggestions,
  analyzePostPerformance,
} from "../controllers/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.post("/generate-hashtags", generateHashtags);
router.post("/generate-caption", generateCaption);
router.post("/generate-comment", generateComment);
router.post("/content-suggestions", getContentSuggestions);
router.post("/analyze-performance", analyzePostPerformance);

export default router;
