const express = require('express');
const router = express.Router();
const FieldSettings = require('../models/FieldSettings');
const authMiddleware = require('../middleware/authMiddleware');

function getUserId(req) {
  if (!req.user) return null;
  return req.user.id || req.user._id || req.user.userId || null;
}

// GET user settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const settings = await FieldSettings.findOne({ user: userId }).lean();
    if (!settings) return res.json({ fields: [] });

    res.json(settings);
  } catch (err) {
    console.error('GET /api/field-settings error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create/update settings
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { fields } = req.body;
    if (!Array.isArray(fields)) return res.status(400).json({ message: 'fields must be an array' });

    const settings = await FieldSettings.findOneAndUpdate(
      { user: userId },
      { fields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json(settings);
  } catch (err) {
    console.error('POST /api/field-settings error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
