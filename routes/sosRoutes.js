const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user"); // ✅ lowercase 'user' file name

// ✅ POST /api/sos/send
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emergencyContact) {
      return res
        .status(400)
        .json({ message: "No emergency contact saved in profile." });
    }

    // ✅ Configure mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail ID
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // ✅ Define mail details
    const mailOptions = {
      from: `"WellNest SOS" <${process.env.EMAIL_USER}>`,
      to: user.emergencyContact,
      subject: "🚨 WellNest Emergency Alert",
      text: `🚨 SOS Alert: ${user.email} has triggered an emergency alert from WellNest. Please reach out immediately!`,
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `SOS alert sent successfully to ${user.emergencyContact}!`,
    });
  } catch (error) {
    console.error("❌ Error sending SOS email:", error);
    res.status(500).json({ message: "Failed to send SOS alert." });
  }
});

module.exports = router;
