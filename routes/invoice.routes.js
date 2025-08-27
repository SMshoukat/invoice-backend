const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Create invoice — requires token
// ✅ Create invoice — requires token
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("📦 Full request body:", req.body);
    console.log("🪙 Currency received:", req.body.currency);

    const {
      companyName = "",
      clientName = "",
      invoiceNumber = "",
      date = null,
      dueDate = null,
      paymentTerms,
      paymentMode,
      notes = "",
      items = [],
      logo = "",
      currency,
      total,
    } = req.body;

    // 🔒 Clean total before saving
    const cleanedTotal =
      typeof total === "string"
        ? parseFloat(total.replace(/[^0-9.-]+/g, "")) || 0
        : Number(total) || 0;

    const invoiceData = {
      user: req.user.id,
      companyName: companyName.trim(),
      clientName: clientName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      date,
      dueDate,
      notes,
      paymentTerms,
      paymentMode,
      items,
      logo,
      currency,
      total: cleanedTotal,
    };

    const invoice = await Invoice.create(invoiceData);

    res.status(201).json(invoice);
  } catch (err) {
    console.error("Invoice creation error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ✅ GET /api/invoices?page=1&search=clientName
router.get("/", authMiddleware, async (req, res) => {
  const { page = 1, search = "" } = req.query;
  const PAGE_SIZE = 5;

  try {
    const query = {
      user: req.user.id,
    };

    if (search) {
      query.clientName = { $regex: search, $options: "i" };
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    res.json({ invoices, total, page: Number(page) });
  } catch (err) {
    console.error("Fetch invoices error:", err.message);
    res.status(500).json({ error: "Failed to get invoices" });
  }
});

// ✅ Get one invoice (only if owned by user)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    res.json(invoice);
  } catch {
    res.status(404).json({ error: "Invoice not found" });
  }
});

// ✅ Delete invoice (only if owned by user)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(400).json({ error: "Delete failed" });
  }
});

// ✅ Update invoice (only if owned by user)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });

    res.json(updated);
  } catch {
    res.status(400).json({ error: "Update failed" });
  }
});

module.exports = router;
