const express = require("express");
const { addMood, getUserMoods } = require("../controllers/moodController");
const router = express.Router();

// POST - Add a mood
router.post("/add", addMood);

// GET - List moods for a user
router.get("/list", getUserMoods);

module.exports = router;
