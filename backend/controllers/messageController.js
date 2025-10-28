import Message from "../models/Message.js";
import cloudinary from "../config/cloudinary.js";


// send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiver, text } = req.body;
    if (!receiver) return res.status(400).json({ message: "Receiver is required" });

    let imageUrl = null;

    if (req.file) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "chat-app/messages",
      });
      imageUrl = result.secure_url;
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      text,
      image: imageUrl,
    });

    res.status(201).json({ message: "Message sent!", data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message." });
  }
};

// Get conversation between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // other user's id
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
};

// Update message status (delivered/seen)
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId, status } = req.body;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    res.status(200).json({ message: "Status updated!", data: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status." });
  }
};
