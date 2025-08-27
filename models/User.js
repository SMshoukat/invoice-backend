const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // 👇 Yeh aapka naya field defaultInvoiceInfo hai
    defaultInvoiceInfo: {
      companyName: { type: String, default: "" },
      clientName: { type: String, default: "" },
      invoiceNumber: { type: String, default: "" },
      date: { type: String, default: "" },
      dueDate: { type: String, default: "" },
      notes: { type: String, default: "" },
      paymentTerms: { type: String, default: "" },
      currency: { type: String, default: "USD" },
      logo: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
