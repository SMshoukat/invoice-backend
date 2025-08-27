const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
    // ✅ Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Get user and check role
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    // ✅ Attach user to request object for downstream use
    req.user = user;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(401).json({ error: "Unauthorized or invalid token" });
  }
};

module.exports = isAdmin;
