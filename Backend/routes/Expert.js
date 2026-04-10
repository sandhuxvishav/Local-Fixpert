const express = require("express");
const router = express.Router();
const Expert = require("../models/Expert"); // make sure Expert model exists
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


router.post("/regexpert", async (req, res) => {
  try {
    const newExpert = new Expert(req.body);
    await newExpert.save();

    res.status(201).json({
      message: "Expert registered successfully",
      expert: newExpert,
    });
  } catch (error) {
    console.error("Error saving expert:", error); // <--- log actual error
    res.status(500).json({ message: "Error registering expert", error: error.message });
  }
});

// ✅ API: Get All Experts
router.get("/experts", async (req, res) => {
  const experts = await Expert.find();
  res.json(experts);
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // identifier = email OR expertID
    if (!identifier || !password) {
      return res.status(400).json({ message: "Credentials required" });
    }

    // 🔍 Find by email OR expertID
    const expert = await Expert.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { expertID: identifier.toUpperCase() },
      ],
    });

    if (!expert) {
      return res.status(400).json({ message: "Expert not found" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, expert.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ (Optional) JWT Token
    const token = jwt.sign(
      { id: expert._id, role: "expert" },
      "SECRET_KEY", // 🔴 move to .env later
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      expert,
      token,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Only allow safe fields
    const updates = {
      fullName: req.body.fullName,
      mobile: req.body.mobile,
      category: req.body.category,
      experience: req.body.experience,
      language: req.body.language,
      serviceArea: req.body.serviceArea,
      profilePhoto: req.body.profilePhoto,
    };

    const updatedExpert = await Expert.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedExpert) {
      return res.status(404).json({ message: "Expert not found" });
    }

    res.json(updatedExpert);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});


module.exports = router;
