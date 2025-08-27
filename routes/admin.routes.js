const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

// ✅ GET /api/admin/stats → Total users, invoices, and revenue
router.get("/stats", authMiddleware, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInvoices = await Invoice.countDocuments();

    const revenueResult = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      totalUsers,
      totalInvoices,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    res.status(500).json({ error: "Failed to load admin stats" });
  }
});

// ✅ GET /api/admin/users → Paginated user list (without passwords)
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password");

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Admin users error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ GET /api/admin/invoices → Paginated + Filtered by company
router.get("/invoices", authMiddleware, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const company = req.query.company || "";

    const query = {};

    if (company) {
      query.companyName = company; // ✅ match schema field
    }

    const totalInvoices = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email"); // ✅ show user name/email

    res.status(200).json({
      invoices,
      totalInvoices,
      totalPages: Math.ceil(totalInvoices / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Admin invoices error:", error.message);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// ✅ PUT /api/admin/invoices/:id → Update any invoice
router.put("/invoices/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    console.log("🔄 PUT /api/admin/invoices/:id");
    console.log("🧾 Invoice ID:", req.params.id);
    console.log("📦 Payload:", req.body);

    if (!req.body || typeof req.body !== "object") {
      console.warn("⚠️ Invalid request body");
      return res.status(400).json({ error: "Invalid request body" });
    }

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      console.warn("❌ Invoice not found for update");
      return res.status(404).json({ error: "Invoice not found" });
    }

    console.log("✅ Invoice updated:", updated);
    res.json(updated);
  } catch (err) {
    console.error("🚨 Admin update error:", err.message);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

// ✅ DELETE /api/admin/invoices/:id → Admin can delete any invoice
router.delete("/invoices/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ error: "Invoice not found" });

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Admin delete error:", error.message);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

// ✅ Unified POST /api/admin/invoices
router.post("/invoices", authMiddleware, isAdmin, async (req, res) => {
  try {
    const {
      invoiceNumber,
      clientName,
      companyName,
      date,
      dueDate,
      notes,
      paymentTerms,
      items,
      total,
      logo,
    } = req.body;

    if (!invoiceNumber || !clientName || !companyName || !total) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newInvoice = new Invoice({
      invoiceNumber,
      clientName,
      companyName,
      date,
      dueDate,
      notes,
      paymentTerms,
      items,
      total,
      logo,
      user: req.user.id,
    });

    const saved = await newInvoice.save();
    res.status(201).json({ message: "Invoice created", invoice: saved });
  } catch (error) {
    console.error("🚨 POST /admin/invoices error:", error.message);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

/// ✅ GET /api/admin/invoice-companies
router.get("/invoice-companies", authMiddleware, isAdmin, async (req, res) => {
  try {
    // Use the correct field: companyName (not invoiceInfo.companyName)
    const companies = await Invoice.distinct("companyName");

    res.json({ companies });
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/admin/invoices/:id → Fetch one invoice by ID (for view page)
router.get("/invoices/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice by ID:", error.message);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

module.exports = router;
