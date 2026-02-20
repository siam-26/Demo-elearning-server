const AdminNotification = require("../models/adminnotification.model");


exports.createAdminNotification = async ({ sender, type, message, link }) => {
  return await AdminNotification.create({ sender, type, message, link });
};


exports.getAdminNotifications = async (req, res) => {
  try {
    const notifs = await AdminNotification.find().sort({ createdAt: -1 });
    res.json({ success: true, notifications: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
