const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const User = require("../models/User");
const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

// ✅ Add this new route
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
