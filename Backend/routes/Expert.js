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

module.exports = router;
