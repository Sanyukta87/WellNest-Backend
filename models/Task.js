const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    points: { type: Number, default: 10 },
    date: { type: String, required: true },
    category: { type: String, default: "wellness" },
    completedBy: [{ type: String }],
    isCoreWellness: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
