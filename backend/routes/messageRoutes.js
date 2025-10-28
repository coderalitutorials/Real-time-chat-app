import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import protect from "../middlewares/authMiddleware.js";
import { sendMessage, getMessages, updateMessageStatus } from "../controllers/messageController.js";

dotenv.config();

const router = express.Router();

// Cloudinary storage for message images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat-app/messages",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
  },
});

const parser = multer({ storage });

// Send text + optional image
router.post("/", protect, parser.single("image"), sendMessage);

// Get conversation with a user
router.get("/:userId", protect, getMessages);

// Update message status (delivered/seen)
router.put("/status", protect, updateMessageStatus);

export default router;
