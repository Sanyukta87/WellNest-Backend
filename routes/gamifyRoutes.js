const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// 🌿 Increment points and streak
router.post("/update", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate
      ? new Date(user.lastActiveDate).toDateString()
      : null;

    // Update streak if consecutive
    if (lastActive && today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      if (lastActive === yesterdayStr) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
    } else if (!lastActive) {
      user.streak = 1;
    }

    user.points += 10; // 🎯 reward points
    user.lastActiveDate = new Date();
    await user.save();

    res.json({
      message: "Wellness progress updated 🌿",
      points: user.points,
      streak: user.streak,
    });
  } catch (err) {
    console.error("Gamify update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/progress", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      points: user.points,
      streak: user.streak,
    });
  } catch (err) {
    console.error("Gamify progress error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
