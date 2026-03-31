const express = require("express");
const router = express.Router();
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Force SDK to use v1 endpoint instead of v1beta
process.env.GENERATIVE_LANGUAGE_API_BASE = "https://generativelanguage.googleapis.com/v1";

// ✅ Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Use a model confirmed to exist on v1 (gemini-1.0-pro)
const model = genAI.getGenerativeModel({ model: "models/gemini-1.0-pro" });

// 🧠 In-memory conversation storage for short-term context
const sessionHistory = {};

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ reply: "Message required" });
    }

    // Track last 10 messages per user for small context memory
    if (!sessionHistory[userId]) sessionHistory[userId] = [];
    sessionHistory[userId].push(`User: ${message}`);

    if (sessionHistory[userId].length > 10) {
      sessionHistory[userId] = sessionHistory[userId].slice(-10);
    }

    const context = sessionHistory[userId].join("\n");

    const prompt = `
You are WellNest 🌿, a calm and empathetic mental health companion for students.
Your tone is warm, positive, and encouraging.
Keep replies short (1–2 sentences), emotionally aware, and never robotic.
Conversation so far:
${context}
WellNest:
`;

    // ✨ Generate response using Gemini
    const result = await model.generateContent(prompt);
    const aiReply = result.response.text();

    // Store AI response
    sessionHistory[userId].push(`WellNest: ${aiReply}`);

    res.json({ reply: aiReply });
  } catch (error) {
    console.error("💥 Gemini API Error:");
    console.error("Message:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error instanceof Error) {
      console.error("Stack:", error.stack);
    } else {
      console.error("Full Error:", error);
    }

    res.status(500).json({
      reply: "I'm here for you 🌿 but Gemini is having trouble responding right now.",
    });
  }
});

module.exports = router;
