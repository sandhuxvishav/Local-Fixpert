const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                         🔹 POST: Create New Booking                        */
/* -------------------------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
      userId, // ✅ now coming from frontend
      expertId,
      expertName,
      serviceType,
      description,
      date,
      location,
      mobile,
      payment,
      time,
    } = req.body;

    if (!userId || !expertId || !date || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newBooking = await Booking.create({
      userId,
      expertId,
      expertName,
      serviceType,
      description,
      date,
      location,
      mobile,
      payment,
      time,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("❌ Booking creation failed:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/*                     🔹 GET: Fetch All Bookings for a User                  */

router.get("/mybookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId })
      .populate("expertId", "name category mobile")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Failed to fetch bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});
// cancel booking
router.put("/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// rebook
router.post("/rebook/:id", async (req, res) => {
  try {
    const oldBooking = await Booking.findById(req.params.id);

    if (!oldBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const newBooking = await Booking.create({
      ...oldBooking.toObject(),
      _id: undefined,
      status: "pending",
      createdAt: undefined,
      updatedAt: undefined,
    });

    res.json({ success: true, booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/status/:id", async (req, res) => {
  let { status } = req.body;

  try {
    status = status.toLowerCase(); // 🔥 normalize

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
});

router.get("/expert/:expertId", async (req, res) => {
  try {
    const bookings = await Booking.find({
      expertId: req.params.expertId,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

/*        🔹 GET: Count bookings by status (for expert dashboard)             */

router.get("/stats/:expertId", async (req, res) => {
  try {
    const { expertId } = req.params;

    // 🔴 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(expertId)) {
      return res.status(400).json({ message: "Invalid expertId" });
    }

    const stats = await Booking.aggregate([
      {
        $match: {
          expertId: new mongoose.Types.ObjectId(expertId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
    };

    stats.forEach((item) => {
      const key = item._id?.toLowerCase();
      if (result.hasOwnProperty(key)) {
        result[key] = item.count;
        result.total += item.count;
      }
    });

    res.json({ success: true, stats: result });
  } catch (error) {
    console.error("❌ Stats error FULL:", error); // 👈 log full error
    res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message, // 👈 send actual error
    });
  }
});

router.get("/expert/active/:expertId", async (req, res) => {
  try {
    const { expertId } = req.params;

    const bookings = await Booking.find({
      expertId,
      status: "confirmed",
      // status: { $in: ["pending", "confirmed"] }, // ✅ filter here
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("❌ Error fetching active bookings:", err);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// POST /bookservice/rate/:id
const Review = require("../models/Review");
const Expert = require("../models/Expert");

router.post("/rate/:id", async (req, res) => {
  try {
    const { rating, review } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res
        .status(400)
        .json({ msg: "Only completed bookings can be rated" });
    }

    if (booking.isRated) {
      return res.status(400).json({ msg: "Already rated" });
    }

    // ✅ CREATE REVIEW
    await Review.create({
      bookingId: booking._id,
      expertId: booking.expertId,
      userId: booking.userId,
      rating,
      review,
    });

    // ✅ mark booking rated
    booking.isRated = true;
    await booking.save();

    // ✅ update expert rating
    const expert = await Expert.findById(booking.expertId);

    if (expert) {
      const total = expert.rating.average * expert.rating.count + rating;

      expert.rating.count += 1;
      expert.rating.average = total / expert.rating.count;

      await expert.save();
    }

    res.json({ msg: "Review submitted" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// get reviews
router.get("/reviews/:expertId", async (req, res) => {
  try {
    const reviews = await Review.find({
      expertId: req.params.expertId,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
