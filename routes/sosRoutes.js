const express = require("express");
<<<<<<< HEAD
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const twilio = require("twilio");
require("dotenv").config();

// Twilio Client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// POST /api/sos/call
router.post("/call", authMiddleware, async (req, res) => {
=======
const nodemailer = require("nodemailer");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User"); // ✅ lowercase 'user' file name

// ✅ POST /api/sos/send
router.post("/send", authMiddleware, async (req, res) => {
>>>>>>> d55632685cfa82eb758f06fce8c9f796e366f0fd
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emergencyContact) {
<<<<<<< HEAD
      return res.status(400).json({
        message: "No emergency contact saved in profile.",
      });
    }

    // Twilio call message URL
    const twimlUrl = "http://demo.twilio.com/docs/voice.xml";

    // Trigger phone call
    const call = await client.calls.create({
      url: twimlUrl,
      to: user.emergencyContact, // phone number to call
      from: process.env.TWILIO_PHONE, // your Twilio phone number
    });

    return res.json({
      success: true,
      message: `SOS CALL initiated to ${user.emergencyContact}!`,
      call,
    });
  } catch (error) {
    console.error("❌ Error making SOS Call:", error);
    return res.status(500).json({
      message: "Failed to make SOS call.",
    });
=======
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
>>>>>>> d55632685cfa82eb758f06fce8c9f796e366f0fd
  }
});

module.exports = router;
