const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal");
const authMiddleware = require("../middleware/authMiddleware");
const { analyzeJournalContent } = require("../utils/wellness");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    const analysis = analyzeJournalContent(`${title} ${content}`, tags);

    const newEntry = new Journal({
      userId: req.user.id,
      title,
      content,
      tags: analysis.tags,
      emotion: analysis.emotion,
      triggerKeywords: analysis.triggers,
      sentiment: analysis.sentiment,
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: "Error adding journal entry", error });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching journals", error });
  }
});

router.get("/insights", authMiddleware, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user.id }).sort({ date: -1 }).limit(30);

    const emotionCounts = {};
    const triggerCounts = {};
    const tagCounts = {};
    const sentimentBreakdown = { positive: 0, neutral: 0, mixed: 0, negative: 0 };

    journals.forEach((entry) => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      (entry.triggerKeywords || []).forEach((trigger) => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
      (entry.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      const label = entry.sentiment?.label || "neutral";
      sentimentBreakdown[label] = (sentimentBreakdown[label] || 0) + 1;
    });

    const mostCommonEmotion =
      Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "reflective";

    const frequentTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([trigger, count]) => ({ trigger, count }));

    const tagDistribution = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));

    res.json({
      totalEntries: journals.length,
      mostCommonEmotion,
      frequentTriggers,
      tagDistribution,
      sentimentBreakdown,
      latestEntry: journals[0] || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching journal insights", error });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Journal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting journal", error });
  }
});

module.exports = router;
