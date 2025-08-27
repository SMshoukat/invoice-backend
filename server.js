const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables and connect to MongoDB
dotenv.config();
connectDB();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" })); // Increased JSON payload limit
app.use(express.urlencoded({ extended: true, limit: "5mb" })); // For form submissions

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Invoice Backend API is running...");
});

// ✅ API Routes
app.use("/api/auth", require("./routes/auth.routes")); // Auth (login/register)
app.use("/api/invoices", require("./routes/invoice.routes")); // Invoices CRUD
app.use("/api/admin", require("./routes/admin.routes")); // Admin-only routes

const fieldSettingsRoutes = require("./routes/fieldSettings.routes");
app.use("/api/field-settings", fieldSettingsRoutes);
app.use("/api/user", require("./routes/user.routes"));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
