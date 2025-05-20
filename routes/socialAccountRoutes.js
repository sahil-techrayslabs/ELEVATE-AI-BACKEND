import express from "express";
import {
  connectAccount,
  getAccounts,
  getAccountAnalytics,
  updateAccountSettings,
  disconnectAccount,
} from "../controllers/socialAccountController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.route("/").get(getAccounts).post(connectAccount);

router.route("/:id").delete(disconnectAccount);

router.route("/:id/analytics").get(getAccountAnalytics);

router.route("/:id/settings").put(updateAccountSettings);

export default router;
