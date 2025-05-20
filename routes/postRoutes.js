import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  schedulePost,
  getPostEngagement,
  updatePostEngagement,
} from "../controllers/postController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.route("/").get(getPosts).post(createPost);

router.route("/:id").get(getPost).put(updatePost).delete(deletePost);

router.route("/:id/schedule").post(schedulePost);

router
  .route("/:id/engagement")
  .get(getPostEngagement)
  .put(updatePostEngagement);

export default router;
