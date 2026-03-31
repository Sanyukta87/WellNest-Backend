const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { getBadges, getLevel } = require("../utils/wellness");

router.post("/update", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate
      ? new Date(user.lastActiveDate).toDateString()
      : null;

    if (lastActive && today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActive === yesterday.toDateString()) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
    } else if (!lastActive) {
      user.streak = 1;
    }

    user.points += 10;
    user.lastActiveDate = new Date();
    await user.save();

    const levelInfo = getLevel(user.points);
    res.json({
      message: "Wellness progress updated",
      points: user.points,
      streak: user.streak,
      level: levelInfo.level,
      badges: getBadges(user.streak, user.points),
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

    const levelInfo = getLevel(user.points);
    const progressWithinLevel = Math.max(user.points - levelInfo.min, 0);
    const levelSpan = Math.max(levelInfo.nextLevelPoints - levelInfo.min, 1);

    res.json({
      points: user.points,
      streak: user.streak,
      level: levelInfo.level,
      nextLevelPoints: levelInfo.nextLevelPoints,
      progressPercent: Math.min(Math.round((progressWithinLevel / levelSpan) * 100), 100),
      badges: getBadges(user.streak, user.points),
    });
  } catch (err) {
    console.error("Gamify progress error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
