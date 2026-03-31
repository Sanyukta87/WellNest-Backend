const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const twilio = require("twilio");

// Create Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// POST /api/sos/call
router.post("/call", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emergencyContact) {
      return res.status(400).json({
        message: "No emergency contact saved in profile."
      });
    }

    const twimlUrl = "http://demo.twilio.com/docs/voice.xml";

    const call = await client.calls.create({
      url: twimlUrl,
      to: user.emergencyContact,
      from: process.env.TWILIO_PHONE
    });

    return res.json({
      success: true,
      message: `SOS CALL initiated to ${user.emergencyContact}!`,
      call
    });

  } catch (error) {
    console.error("❌ Error making SOS Call:", error);
    return res.status(500).json({
      message: "Failed to make SOS call."
    });
  }
});

module.exports = router;