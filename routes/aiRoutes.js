const express = require("express");
const router = express.Router();
const Sentiment = require("sentiment");
const sentiment = new Sentiment();
const { GoogleGenerativeAI } = require("@google/generative-ai"); // assuming Gemini is used
const authMiddleware = require("../middleware/authMiddleware");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🌸 Emotion-aware AI Chat Route
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    // 1️⃣ Analyze sentiment
    const result = sentiment.analyze(message);
    let emotion = "neutral";
    if (result.score > 1) emotion = "happy";
    else if (result.score < -1) emotion = "sad";
    else if (result.score === 0 && message.includes("?")) emotion = "anxious";

    // 2️⃣ Adjust tone for the AI prompt
    let toneInstruction = "";
    switch (emotion) {
      case "happy":
        toneInstruction =
          "Respond with positive encouragement and joyful tone. Celebrate their good mood gently.";
        break;
      case "sad":
        toneInstruction =
          "Respond with empathy, kindness, and emotional support. Use a calm, caring tone.";
        break;
      case "anxious":
        toneInstruction =
          "Respond gently, help them calm their anxiety with short comforting sentences.";
        break;
      default:
        toneInstruction =
          "Respond with a balanced, friendly, and warm tone like a wellness companion.";
    }

    // 3️⃣ Generate AI Response using Gemini / Google Generative AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are WellNest, an empathetic AI wellness companion. 
    The user's emotion is: ${emotion}.
    ${toneInstruction}
    Their message: "${message}"`;

    const resultAI = await model.generateContent(prompt);
    const aiResponse = resultAI.response.text();

    // 4️⃣ Return emotion + AI response
    res.json({
      emotion,
      reply: aiResponse,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

module.exports = router;
