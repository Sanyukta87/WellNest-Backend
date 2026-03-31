const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      required: true,
      enum: ["Happy", "Sad", "Anxious", "Angry", "Neutral", "Calm", "Stressed"],
    },
    emoji: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // ✅ adds createdAt and updatedAt automatically
  }
);

// Prevent OverwriteModelError in development
module.exports = mongoose.models.Mood || mongoose.model("Mood", moodSchema);

