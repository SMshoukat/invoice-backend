const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// Save default invoice info (PUT /api/user/default-invoice)
router.put("/default-invoice", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.defaultInvoiceInfo = req.body; // save sent data in DB
    await user.save();

    res.json({ message: "Default invoice info saved!", defaultInvoiceInfo: user.defaultInvoiceInfo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get default invoice info (GET /api/user/default-invoice)
router.get("/default-invoice", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.defaultInvoiceInfo || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
