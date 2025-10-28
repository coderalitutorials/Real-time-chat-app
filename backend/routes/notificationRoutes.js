import express, { application } from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  getUnreadNotifications,
  markAsRead,
  getUnreadCount,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyToken, getUnreadNotifications);
router.get("/unread-count/:userId", verifyToken, getUnreadCount);
router.put("/mark-read", verifyToken, markAsRead);

export default router;






