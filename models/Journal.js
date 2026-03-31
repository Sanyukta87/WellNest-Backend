const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  emotion: {
    type: String,
    default: "reflective",
  },
  triggerKeywords: {
    type: [String],
    default: [],
  },
  sentiment: {
    score: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      default: "neutral",
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Journal || mongoose.model("Journal", journalSchema);
