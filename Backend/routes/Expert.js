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
// router.get("/experts", async (req, res) => {
//   const experts = await Expert.find();
//   res.json(experts);
// });
const Booking = require("../models/Booking");

router.get("/experts", async (req, res) => {
  try {
    const experts = await Expert.aggregate([
      {
        $lookup: {
          from: "bookings", // ⚠️ must match MongoDB collection name
          localField: "_id",
          foreignField: "expertId",
          as: "bookings",
        },
      },
      {
        $addFields: {
          clients: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "b",
                cond: {
                  $eq: [
                    { $toLower: "$$b.status" },
                    "completed"
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          bookings: 0, // remove heavy data
        },
      },
    ]);

    res.json(experts);
  } catch (error) {
    console.error("❌ Error fetching experts:", error);
    res.status(500).json({ message: "Server error" });
  }
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

// routes/expertRoutes.js

// const { toggleAvailability } = require("../controllers/expertController");

// PATCH /experts/:id/availability
router.patch("/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    // 🔍 Validate input
    if (typeof availability !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Availability must be boolean",
      });
    }

    // 🔎 Find expert
    const expert = await Expert.findById(id);
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    // 🔄 Update availability
    expert.isAvailable = availability;

    await expert.save();

    return res.status(200).json({
      success: true,
      message: `Expert is now ${availability ? "available" : "unavailable"}`,
      expert,
    });

  } catch (error) {
    console.error("Toggle Availability Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



module.exports = router;
