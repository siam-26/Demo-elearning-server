const UserNotification = require("../models/notification.model");


exports.createUserNotification = async ({ receiver, type, message, link }) => {
  return await UserNotification.create({ receiver, type, message, link });
};


exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.user; // middleware থেকে আসছে

    const notifs = await UserNotification.find({ receiver: userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// Controller Logic
exports.sendGalleryRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // চেক করা হচ্ছে আগে থেকেই পেন্ডিং রিকোয়েস্ট আছে কি না
    const existing = await UserNotification.findOne({
      sender: senderId,
      receiver: receiverId,
      type: "gallery_request",
      status: "pending"
    });

    if (existing) return res.status(400).json({ message: "Request already pending!" });

    const notification = new UserNotification({
      receiver: receiverId,
      sender: senderId,
      type: "gallery_request",
      status: "pending",
      message: "আপনার গ্যালারি দেখার জন্য একটি অনুরোধ পাঠিয়েছেন।",
      link: `/user-profile/${senderId}` // রিকোয়েস্টকারীর প্রোফাইল লিংক
    });

    await notification.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// রিকোয়েস্ট একসেপ্ট বা রিজেক্ট করা
exports.handleGalleryAction = async (req, res) => {
  const { notificationId, action } = req.body;
  try {
    const notification = await UserNotification.findByIdAndUpdate(
      notificationId,
      { status: action, isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (action === "accepted") {
      await UserNotification.create({
        receiver: notification.sender,
        sender: notification.receiver,
        type: "gallery_request_accepted",
        message: "আপনার গ্যালারি দেখার অনুরোধ গ্রহণ করা হয়েছে!",
        link: `/profile/${notification.receiver}`
      });
    }

    res.status(200).json({ success: true, status: action });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};