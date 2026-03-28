const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },   // ✅ match frontend
    email: { type: String, required: true, unique: true },
    mobile: { type: String },

    profilePhoto: { type: String }, // base64 or URL

    category: { type: String, required: true },
    experience: { type: String },

    serviceArea: { type: String, required: true },
    language: { type: String },

    rating: { type: Number, default: 0 },
    price: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expert", expertSchema);