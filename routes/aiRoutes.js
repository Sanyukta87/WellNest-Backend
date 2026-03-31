const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const authMiddleware = require("../middleware/authMiddleware");

function detectTone(message) {
  const normalized = message.toLowerCase();
  if (["stress", "overwhelmed", "deadline", "pressure"].some((word) => normalized.includes(word))) {
    return "stressed";
  }
  if (["sad", "down", "lonely", "hurt"].some((word) => normalized.includes(word))) {
    return "sad";
  }
  if (["happy", "great", "good", "excited"].some((word) => normalized.includes(word))) {
    return "happy";
  }
  if (["worried", "anxious", "panic", "uncertain"].some((word) => normalized.includes(word))) {
    return "anxious";
  }
  return "neutral";
}

function fallbackReply(tone) {
  switch (tone) {
    case "happy":
      return "That is a meaningful win. Take a second to notice what helped today so you can repeat it.";
    case "sad":
      return "I am sorry today feels heavy. Try one gentle next step like water, fresh air, or texting someone safe.";
    case "stressed":
      return "You have a lot on your mind. Let us shrink it down to one next task and one short reset break.";
    case "anxious":
      return "Let us slow this moment down. Breathe in for 4, out for 6, and focus on only the next controllable thing.";
    default:
      return "I am here with you. Tell me a little more about what feels most important right now.";
  }
}

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .limit(60);
    res.json(messages);
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ message: "Failed to load chat history" });
  }
});

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const message = req.body?.message?.trim();
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const tone = detectTone(message);
    const history = await ChatMessage.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(8);

    const reply = fallbackReply(tone);

    await ChatMessage.insertMany([
      { userId: req.user.id, sender: "user", text: message, tone },
      { userId: req.user.id, sender: "bot", text: reply, tone },
    ]);

    res.json({
      reply,
      emotion: tone,
      contextWindow: history.length,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

module.exports = router;
