const express = require("express");
const router = express.Router();
const Mood = require("../models/Mood");
const Journal = require("../models/Journal");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getDateLabel,
  getLastNDates,
  getMoodLevel,
  getMoodScore,
  normalizeDateKey,
} = require("../utils/wellness");

function buildMoodTrendData(moods) {
  const last7Days = getLastNDates(7);
  const grouped = {};

  moods.forEach((entry) => {
    const key = normalizeDateKey(entry.createdAt);
    if (!grouped[key]) {
      grouped[key] = { totalScore: 0, count: 0, moods: {} };
    }

    grouped[key].totalScore += getMoodScore(entry.mood);
    grouped[key].count += 1;
    grouped[key].moods[entry.mood] = (grouped[key].moods[entry.mood] || 0) + 1;
  });

  return last7Days.map((date) => {
    const key = normalizeDateKey(date);
    const entry = grouped[key] || { totalScore: 0, count: 0, moods: {} };
    const average = entry.count ? Number((entry.totalScore / entry.count).toFixed(2)) : 0;
    const dominantMood =
      Object.entries(entry.moods).sort((a, b) => b[1] - a[1])[0]?.[0] || "No check-in";

    return {
      date: key,
      label: getDateLabel(date),
      average,
      count: entry.count,
      dominantMood,
    };
  });
}

function buildDistribution(moods) {
  const counts = {};
  moods.forEach((entry) => {
    counts[entry.mood] = (counts[entry.mood] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([mood, count]) => ({ mood, count }));
}

function calculateMoodStreak(moods) {
  const sorted = [...moods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!sorted.length) return 0;

  const latestMood = sorted[0].mood;
  let streak = 0;
  for (const entry of sorted) {
    if (entry.mood !== latestMood) break;
    streak += 1;
  }
  return streak;
}

router.get("/mood-trends", authMiddleware, async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const moods = await Mood.find({
      user: req.user.id,
      createdAt: { $gte: since },
    }).sort({ createdAt: 1 });

    const timeline = buildMoodTrendData(moods);
    const distribution = buildDistribution(moods);
    const totalScore = moods.reduce((sum, entry) => sum + getMoodScore(entry.mood), 0);
    const moodAverage = moods.length ? Number((totalScore / moods.length).toFixed(2)) : 0;
    const topMood = distribution[0]?.mood || "No mood data yet";
    const topMoodCount = distribution[0]?.count || 0;
    const topMoodPercent = moods.length ? Math.round((topMoodCount / moods.length) * 100) : 0;
    const previousWindow = timeline.slice(0, 3).filter((item) => item.average > 0);
    const currentWindow = timeline.slice(-3).filter((item) => item.average > 0);
    const previousAverage = previousWindow.length
      ? previousWindow.reduce((sum, item) => sum + item.average, 0) / previousWindow.length
      : 0;
    const currentAverage = currentWindow.length
      ? currentWindow.reduce((sum, item) => sum + item.average, 0) / currentWindow.length
      : 0;

    const alerts = [];
    if (currentAverage > 0 && previousAverage > 0 && currentAverage < previousAverage - 0.75) {
      alerts.push("Mood dropped compared with the start of the week.");
    }
    if (["Sad", "Anxious", "Stressed", "Angry"].includes(topMood) && topMoodPercent >= 50) {
      alerts.push(`You felt ${topMood.toLowerCase()} ${topMoodPercent}% of this week.`);
    }

    res.json({
      timeline,
      distribution,
      weeklyFrequency: distribution,
      moodAverage,
      moodLevel: getMoodLevel(moodAverage),
      moodStreak: calculateMoodStreak(moods),
      topMood,
      topMoodPercent,
      insight: moods.length
        ? `You felt ${topMood.toLowerCase()} ${topMoodPercent}% this week.`
        : "Log a few moods to unlock weekly insights.",
      alerts,
    });
  } catch (error) {
    console.error("Mood trends error:", error);
    res.status(500).json({ message: "Failed to load mood trends" });
  }
});

router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const [journals, moods, tasks] = await Promise.all([
      Journal.find({ userId: req.user.id }).sort({ date: -1 }).limit(7),
      Mood.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(14),
      Task.find({}).sort({ date: -1 }).limit(28),
    ]);

    const insights = [];
    const last3JournalDays = new Set(
      journals.map((entry) => normalizeDateKey(entry.date)).slice(0, 3)
    );

    if (last3JournalDays.size < 3) {
      insights.push(
        "You skipped journaling on some recent days. A short reflection could help you reset."
      );
    }

    const latestMoods = moods.slice(0, 6);
    if (latestMoods.length >= 4) {
      const average =
        latestMoods.reduce((sum, entry) => sum + getMoodScore(entry.mood), 0) /
        latestMoods.length;
      if (average <= 2.4) {
        insights.push(
          "Mood dipped recently. Consider a lighter day plan and one supportive check-in."
        );
      }
    }

    const recentTasks = tasks.filter((task) => task.completedBy.includes(req.user.id)).length;
    if (recentTasks >= 6) {
      insights.push(
        "Great consistency! You have been showing up for your habits this week."
      );
    }

    if (insights.length === 0) {
      insights.push("Your routine looks steady. Keep stacking small wins this week.");
    }

    res.json({ insights });
  } catch (error) {
    console.error("Insights engine error:", error);
    res.status(500).json({ message: "Failed to load insights" });
  }
});

module.exports = router;
