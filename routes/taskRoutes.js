const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

// 🌱 Define Task Schema
const taskSchema = new mongoose.Schema({
  task: String,
  points: Number,
  date: String,
  completedBy: [String],
});
const Task = mongoose.model("Task", taskSchema);

// 🔒 JWT Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// 🌞 GET: Daily tasks
router.get("/", auth, async (req, res) => {
  try {
    const today = new Date().toDateString();
    let tasks = await Task.find({ date: today });

    // If no tasks for today → create defaults
    if (tasks.length === 0) {
      const defaultTasks = [
        { task: "Drink 8 glasses of water 💧", points: 10 },
        { task: "Take a 10-minute walk 🚶‍♀️", points: 15 },
        { task: "Write 3 positive affirmations 🌸", points: 20 },
      ].map((t) => ({ ...t, date: today }));

      tasks = await Task.insertMany(defaultTasks);
    }

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// ✅ POST: Complete a task
router.post("/complete/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!task.completedBy.includes(req.user.id)) {
      task.completedBy.push(req.user.id);
      user.points += task.points;

      // 🌿 Streak logic
      const today = new Date().toDateString();
      const lastActive = user.lastActiveDate
        ? new Date(user.lastActiveDate).toDateString()
        : null;

      if (lastActive === today) {
        // same day
      } else if (
        lastActive &&
        new Date(today).getTime() - new Date(lastActive).getTime() === 86400000
      ) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }

      user.lastActiveDate = new Date();
      await user.save();
      await task.save();
    }

    res.json({ message: "Task completed!", points: user.points, streak: user.streak });
  } catch (err) {
    console.error("Error completing task:", err);
    res.status(500).json({ message: "Error completing task" });
  }
});

module.exports = router;
