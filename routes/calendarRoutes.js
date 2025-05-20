import express from "express";
import {
  addPost,
  getPosts,
  updatePost,
  deletePost,
} from "../controllers/calendarController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Add a new scheduled post
router.post("/add-post", addPost);

// Get all scheduled posts
router.get("/posts", getPosts);

// Update a scheduled post
router.put("/posts/:id", updatePost);

// Delete a scheduled post
router.delete("/posts/:id", deletePost);

export default router;
