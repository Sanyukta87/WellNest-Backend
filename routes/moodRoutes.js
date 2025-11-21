const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/authMiddleware");
const Mood = require("../models/mood");

// Add a mood
router.post("/add", auth, async (req, res) => {
  try {
    const { mood, emoji, note } = req.body;
    const doc = await Mood.create({
      user: req.user.id,
      mood,
      emoji: emoji || "",
      note: note || "",
    });
    res.json(doc);
  } catch (err) {
    console.error("Add mood error:", err);
    res.status(500).json({ message: "Failed to save mood" });
  }
});

// Mood history (latest first)
router.get("/history", auth, async (req, res) => {
  try {
    const items = await Mood.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(items);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Failed to load mood history" });
  }
});

// Mood summary (counts by mood)
router.get("/summary", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const data = await Mood.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $project: { mood: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ message: "Failed to load mood summary" });
  }
});

module.exports = router;
