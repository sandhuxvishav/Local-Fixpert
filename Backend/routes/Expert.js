const express = require("express");
const router = express.Router();
const Expert = require("../models/Expert"); // make sure Expert model exists

// router.post("/regexpert", async (req, res) => {
//   try {
//     const newExpert = new Expert(req.body);
//     await newExpert.save();

//     res.status(201).json({
//       message: "Expert registered successfully",
//       expert: newExpert,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error registering expert" });
//   }
// });
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
  const { email, mobile } = req.body;

  try {
    const expert = await Expert.findOne({ email, mobile });

    if (!expert) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json(expert);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Expert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Expert not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
