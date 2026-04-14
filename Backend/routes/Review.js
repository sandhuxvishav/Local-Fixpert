const express = require("express");
const router = express.Router();
const Review = require("../models/PlatformReview");

// 👉 Add Review
router.post("/review-insert", async (req, res) => {
  try {
    const { stars, reviewText, author, userId } = req.body;

    // basic validation
    if (!stars || !author || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const review = await Review.create({
      stars,
      reviewText,
      author,
      userId,
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add review" });
  }
});

// 👉 Get All Reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }); // latest first

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// 👉 Get Average Rating
router.get("/reviews/average", async (req, res) => {
  try {
    const result = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$stars" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    res.json(result[0] || { avgRating: 0, totalReviews: 0 });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate rating" });
  }
});

// 👉 Delete Review (optional)
router.delete("/review/:id", async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
