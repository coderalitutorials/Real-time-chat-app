
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { verifyTokenSocket } from "./middlewares/authMiddleware.js";
import Message from "./models/Message.js";
import Notification from "./models/Notification.js"; // ✅ NEW

dotenv.config({ quiet: true });

const app = express();

// ✅ Allow multiple frontend ports
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// ✅ Create HTTP + Socket Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Track online users (userId -> socketId)
let onlineUsers = new Map();

// ✅ Authenticate socket connections
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const user = await verifyTokenSocket(token);
    socket.userId = user.id;
    socket.join(socket.userId); // ✅ Join personal room for direct emits
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.userId);

  // Add to online list
  onlineUsers.set(socket.userId, socket.id);
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  // ✅ When a message is sent
  socket.on("sendMessage", async (messageData) => {
    try {
      const { receiver, _id } = messageData;
      const receiverSocket = onlineUsers.get(receiver);

      if (receiverSocket) {
        // Receiver is online → mark delivered
        const updatedMessage = await Message.findByIdAndUpdate(
          _id,
          { status: "delivered" },
          { new: true }
        );

        io.to(receiverSocket).emit("receiveMessage", updatedMessage);
        socket.emit("messageStatusUpdate", updatedMessage);

        // ✅ Create and send notification
        const notification = await Notification.create({
          receiver,
          sender: socket.userId,
          message: _id,
        });

        io.to(receiver).emit("newNotification", {
          senderId: socket.userId,
          messageId: _id,
          notificationId: notification._id,
        });

        // ✅ Update unread count for receiver
        const unreadCount = await Notification.countDocuments({
          receiver,
          isRead: false,
        });
        io.to(receiver).emit("notificationCountUpdated", { unreadCount });
      } else {
        // Receiver offline → keep sent status
        socket.emit("messageStatusUpdate", messageData);

        // ✅ Still store notification (for later)
        await Notification.create({
          receiver,
          sender: socket.userId,
          message: _id,
        });
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  });

  // ✅ When user opens chat or bell, mark notifications as read
// ✅ When user opens chat or bell, mark notifications as read safely
socket.on("markChatRead", async ({ senderId, receiverId }) => {
  try {
    if (!receiverId) return; // Safety check

    const filter = { receiver: receiverId, isRead: false };
    if (senderId) filter.sender = senderId;

    await Notification.updateMany(filter, { isRead: true });

    // ✅ Update unread count for that user
    const unreadCount = await Notification.countDocuments({
      receiver: receiverId,
      isRead: false,
    });

    io.to(receiverId).emit("notificationCountUpdated", { unreadCount });

  } catch (err) {
    console.error("markChatRead error:", err);
  }
});


  // ✅ Seen message handler
  socket.on("messageSeen", async ({ messageId }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: "seen" },
        { new: true }
      );

      if (!message) return;

      const senderSocket = onlineUsers.get(message.sender.toString());
      if (senderSocket) {
        io.to(senderSocket).emit("messageStatusUpdate", message);
      }
    } catch (err) {
      console.error("Message seen error:", err);
    }
  });

  // ✅ Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.userId);
    onlineUsers.delete(socket.userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT} ✅`)
    );
  })
  .catch((err) => console.error(err));


