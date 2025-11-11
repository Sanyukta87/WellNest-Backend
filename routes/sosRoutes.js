const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// POST /api/sos/send
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.emergencyContact) {
      return res.status(400).json({ message: "No emergency contact saved." });
    }

    // Configure mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.emergencyContact,
      subject: "🚨 Emergency Alert from WellNest",
      text: `This is an SOS alert from ${user.name || "a WellNest user"}.
      
User Email: ${user.email}
Message: ${req.body.message || "The user has triggered an SOS alert. Please reach out immediately."}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "SOS alert sent successfully!" });
  } catch (error) {
    console.error("Error sending SOS:", error);
    res.status(500).json({ message: "Failed to send SOS alert." });
  }
});

module.exports = router;
