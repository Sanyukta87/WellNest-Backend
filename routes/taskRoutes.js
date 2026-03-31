const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

const defaultTaskTemplates = [
  { task: "Drink water", points: 10, category: "hydration" },
  { task: "Exercise", points: 20, category: "movement" },
  { task: "Journal", points: 15, category: "reflection" },
  { task: "Meditation", points: 20, category: "mindfulness" },
];

function getTodayKey() {
  return new Date().toDateString();
}

async function ensureDailyTasks() {
  const today = getTodayKey();
  let tasks = await Task.find({ date: today }).sort({ createdAt: 1 });

  if (tasks.length === 0) {
    tasks = await Task.insertMany(
      defaultTaskTemplates.map((task) => ({
        ...task,
        date: today,
        completedBy: [],
        isCoreWellness: true,
      }))
    );
  }

  return tasks;
}

function updateUserStreak(user) {
  const today = new Date().toDateString();
  const lastActive = user.lastActiveDate
    ? new Date(user.lastActiveDate).toDateString()
    : null;

  if (lastActive === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastActive === yesterday.toDateString()) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }

  user.lastActiveDate = new Date();
}

router.get("/", auth, async (req, res) => {
  try {
    const tasks = await ensureDailyTasks();
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

router.get("/summary", auth, async (req, res) => {
  try {
    const tasks = await ensureDailyTasks();
    const completedCount = tasks.filter((task) =>
      task.completedBy.includes(req.user.id)
    ).length;

    res.json({
      total: tasks.length,
      completed: completedCount,
      completionRate: tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0,
    });
  } catch (err) {
    console.error("Error fetching task summary:", err);
    res.status(500).json({ message: "Error fetching task summary" });
  }
});

router.post("/complete/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!task || !user) {
      return res.status(404).json({ message: "Task or user not found" });
    }

    if (!task.completedBy.includes(req.user.id)) {
      task.completedBy.push(req.user.id);
      user.points += task.points;
      updateUserStreak(user);
      await Promise.all([task.save(), user.save()]);
    }

    const todaysTasks = await ensureDailyTasks();
    const completedCount = todaysTasks.filter((item) =>
      item.completedBy.includes(req.user.id)
    ).length;

    res.json({
      message: "Task completed!",
      points: user.points,
      streak: user.streak,
      completionRate: todaysTasks.length
        ? Math.round((completedCount / todaysTasks.length) * 100)
        : 0,
    });
  } catch (err) {
    console.error("Error completing task:", err);
    res.status(500).json({ message: "Error completing task" });
  }
});

module.exports = router;
