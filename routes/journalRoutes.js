const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal");
const jwt = require("jsonwebtoken");

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

// Add Journal Entry
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newEntry = new Journal({ userId: req.userId, title, content });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: "Error adding journal entry", error });
  }
});

// Get User Journals
router.get("/", verifyToken, async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.userId }).sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching journals", error });
  }
});

// Delete Journal Entry
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Journal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting journal", error });
  }
});

module.exports = router;
