const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Optional: only needed if you have a User model
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    clientName: String,
    invoiceNumber: String,
    date: String,
    dueDate: String,
    notes: String,
    discountType: { type: String, default: "percentage" },
    discountValue: { type: Number, default: 0 },
    discountLabel: { type: String, default: "Discount" },
    paymentTerms: {
      type: String,
      default: "",
    },
    paymentMode: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "USD",
    },

    items: [
      {
        description: String,
        quantity: Number,
        price: Number,
      },
    ],
    total: Number,
    logo: String, // base64
    // Optional: in case you're storing logos per invoice
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
