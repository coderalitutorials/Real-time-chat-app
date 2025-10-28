import User from "../models/User.js";

// Get all users with online status
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email image online _id");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Update online status
export const updateOnlineStatus = async (req, res) => {
  const { online } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { online },
      { new: true, fields: "name email image online _id" }
    );
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user, message: "Status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};
