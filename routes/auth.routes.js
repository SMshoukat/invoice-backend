// invoice-backend/routes/auth.routes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    // 🛠 DEBUG START
    console.log("📩 Incoming Register Body:", req.body);
    console.log("🪙 Currency received during REGISTER:", req.body.currency);
    // 🛠 DEBUG END

    const { name, email, password, role, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      currency: currency || "USD", // Default currency if none provided
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error("❌ Error in REGISTER:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    // 🛠 DEBUG START
    console.log("📩 Incoming Login Body:", req.body);
    console.log("🪙 Currency received during LOGIN:", req.body.currency);
    // 🛠 DEBUG END

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currency: user.currency, // Send stored currency to frontend
      },
    });
  } catch (error) {
    console.error("❌ Error in LOGIN:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
