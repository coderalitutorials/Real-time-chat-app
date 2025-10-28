import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email",
    ],
  },
  password: { type: String, required: [true, "Password is required"] },
  image: { type: String, default: "" },
  online: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
