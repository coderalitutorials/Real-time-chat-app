import Notification from "../models/Notification.js";

// ✅ Get all unread notifications for logged-in user
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ receiver: userId, isRead: false })
      .populate("sender", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications" });
  }
};

// ✅ Mark notifications as read when user opens chat
export const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user.id;

    await Notification.updateMany(
      { receiver: userId, sender: senderId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Server error while marking notifications" });
  }
};

// ✅ Get unread count only
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ receiver: userId, isRead: false });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error counting notifications:", error);
    res.status(500).json({ message: "Server error while counting notifications" });
  }
};
