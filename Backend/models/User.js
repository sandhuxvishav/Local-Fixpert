// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
  name: String,
  email: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("User", userSchema);
