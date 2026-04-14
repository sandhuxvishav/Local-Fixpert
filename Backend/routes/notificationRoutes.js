// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ✅ Get notifications (user OR expert)
router.get("/:id", async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { userId: req.params.id },
        { expertId: req.params.id },
      ],
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// ✅ Mark all as read
router.patch("/read/:id", async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { userId: req.params.id },
          { expertId: req.params.id },
        ],
      },
      { read: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});

module.exports = router;