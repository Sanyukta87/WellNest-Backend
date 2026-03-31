const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    tone: {
      type: String,
      default: "neutral",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
