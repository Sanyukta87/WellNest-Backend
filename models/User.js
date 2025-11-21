const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "" },
  age: { type: Number, default: null },
  institution: { type: String, default: "" },
  avatar: { type: String, default: "" },
  about: { type: String, default: "" },
  goals: { type: String, default: "" },
  emergencyContact: { type: String, default: "" },
  // 🌿 Gamified fields
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
});

// ✅ Fix OverwriteModelError by reusing existing model if it exists
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
