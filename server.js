const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const journalRoutes = require("./routes/journalRoutes");
const profileRoutes = require("./routes/profileRoutes");
const taskRoutes = require("./routes/taskRoutes");
const gamifyRoutes = require("./routes/gamifyRoutes");
const aiRoutes = require("./routes/aiRoutes");
const sosRoutes = require("./routes/sosRoutes"); // SOS route

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/gamify", gamifyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sos", sosRoutes); // SOS endpoint

// Health check
app.get("/", (req, res) => {
  res.send("🌿 WellNest Backend is running properly!");
});

// Start server — Render requires process.env.PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
