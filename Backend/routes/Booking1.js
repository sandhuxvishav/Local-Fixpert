const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Review = require("../models/Review");
const Expert = require("../models/Expert");

/* -------------------------------------------------------------------------- */
/*                         🔹 POST: Create New Booking                        */
/* -------------------------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
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

    // 🔔 Notify Expert
    await Notification.create({
      expertId,
      message: "📩 New service request received",
      type: "booking",
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

/* -------------------------------------------------------------------------- */
/*                     🔹 GET: Fetch All Bookings for a User                  */
/* -------------------------------------------------------------------------- */
router.get("/mybookings/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate("expertId", "name category mobile")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });

  } catch (error) {
    console.error("❌ Failed to fetch bookings:", error.message);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

/* -------------------------------------------------------------------------- */
/*                           🔹 CANCEL BOOKING                                */
/* -------------------------------------------------------------------------- */
router.put("/cancel/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ success: true, booking });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                              🔹 REBOOK                                     */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                         🔹 UPDATE STATUS                                   */
/* -------------------------------------------------------------------------- */
router.put("/status/:id", async (req, res) => {
  let { status } = req.body;

  try {
    status = status.toLowerCase();

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔔 Notify User
    await Notification.create({
      userId: booking.userId,
      message: `✅ Your booking has been ${status}`,
      type: "status",
    });

    res.json(booking);

  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
});

/* -------------------------------------------------------------------------- */
/*                       🔹 GET BOOKINGS FOR EXPERT                           */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                      🔹 GET STATS FOR DASHBOARD                            */
/* -------------------------------------------------------------------------- */
router.get("/stats/:expertId", async (req, res) => {
  try {
    const { expertId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expertId)) {
      return res.status(400).json({ message: "Invalid expertId" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

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

    const thisMonthCompleted = await Booking.countDocuments({
      expertId,
      status: "completed",
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const result = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      thisMonth: thisMonthCompleted,
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
    console.error("❌ Stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* -------------------------------------------------------------------------- */
/*                         🔹 ACTIVE BOOKINGS                                 */
/* -------------------------------------------------------------------------- */
router.get("/expert/active/:expertId", async (req, res) => {
  try {
    const bookings = await Booking.find({
      expertId: req.params.expertId,
      status: "confirmed",
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });

  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

/* -------------------------------------------------------------------------- */
/*                         🔹 RATE + REVIEW                                   */
/* -------------------------------------------------------------------------- */
router.post("/rate/:id", async (req, res) => {
  try {
    let { rating, review } = req.body;
    rating = Number(rating);

    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.status.toLowerCase() !== "completed") {
      return res.status(400).json({ msg: "Only completed bookings" });
    }

    if (booking.isRated) {
      return res.status(400).json({ msg: "Already rated" });
    }

    // ✅ Create review
    await Review.create({
      bookingId: booking._id,
      expertId: booking.expertId,
      userId: booking.userId,
      rating,
      review,
    });

    // ⭐ Update expert rating
    const expert = await Expert.findById(booking.expertId);

    if (expert) {
      expert.rating.count += 1;
      expert.rating.average =
        (expert.rating.average * (expert.rating.count - 1) + rating) /
        expert.rating.count;

      await expert.save();
    }

    // 🔔 Notify Expert
    await Notification.create({
      expertId: booking.expertId,
      message: "🌟 You got a new 5-star review!",
      type: "review",
    });

    booking.isRated = true;
    await booking.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                         🔹 GET REVIEWS                                     */
/* -------------------------------------------------------------------------- */
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