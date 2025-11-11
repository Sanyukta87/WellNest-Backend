const Mood = require("../models/Mood");
const jwt = require("jsonwebtoken");

// Add a new mood
exports.addMood = async (req, res) => {
  try {
    console.log("Incoming mood request body:", req.body);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("❌ No Authorization header found");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token received:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const newMood = new Mood({
      userId: decoded.id,
      mood: req.body.mood,
    });

    await newMood.save();
    console.log("✅ Mood saved:", newMood);

    res.status(201).json({ message: "Mood saved successfully 🌿" });
  } catch (error) {
    console.error("❌ Error saving mood:", error);
    res.status(500).json({ message: error.message || "Server error saving mood" });
  }
};

// Get all moods for a user
exports.getUserMoods = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const moods = await Mood.find({ userId: decoded.id }).sort({ date: -1 });
    res.json(moods);
  } catch (error) {
    console.error("❌ Error fetching moods:", error);
    res.status(500).json({ message: error.message || "Server error fetching moods" });
  }
};
