



import express from "express";
import { signup, login,logout } from "../controllers/authControllers.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import  authMiddleware  from "../middlewares/authMiddleware.js"; // ✅ import this

dotenv.config();

const router = express.Router();

// Cloudinary setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat-app/users",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const parser = multer({ storage });

router.post("/signup", parser.single("image"), signup);
router.post("/login", login);
router.post("/logout", logout);
// ✅ Add verify route
router.get("/verify", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user, // user info decoded from token
  });
});

export default router;
