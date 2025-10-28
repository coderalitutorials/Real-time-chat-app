import express from "express";
import { getAllUsers, updateOnlineStatus } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.patch("/:id/online", authMiddleware, updateOnlineStatus);

export default router;
