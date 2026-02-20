// controllers/subscriptionPlan.controller.js

const AdminNotification = require("../models/adminnotification.model");
const UserNotification = require("../models/notification.model");
const SubscriptionPlan = require("../models/subscritionAd.model");
const Users = require("../models/user.model");


// Create Plan (but prevent duplicate by name)
exports.createPlan = async (req, res) => {
  try {
    const {name, price, duration, smsLimit, interestLimit, tag} = req.body;

    // Check if same name plan exists
    const exists = await SubscriptionPlan.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: `${name} plan already exists. Please edit instead.` });
    }

    const plan = new SubscriptionPlan({ name, price, duration, smsLimit, interestLimit, tag});
    await plan.save();

    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ------------------------
// User buys subscription
// ------------------------
exports.requestSubscription = async (req, res) => {
  try {
    const { userId, planName, paymentNumber, transactionId, screenshot } = req.body;

    const plan = await SubscriptionPlan.findOne({ name: planName });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // create subscription request
    user.subscription = {
      plan: plan.name,
      smsLimit: plan.smsLimit,
       interestLimit: plan.interestLimit,
      usedInterest: 0,
      usedSms: 0,
      price: plan.price,
      status: "pending",
      paymentNumber,
      transactionId,
      screenshot
    };

    await user.save();

    // -------------------
    // Admin Notification
    // -------------------
    await AdminNotification.create({
      sender: user._id,
      type: "subscription_request",
      message: `${user.name} requested for ${plan.name} plan`,
      link: "/admin/subscriptions"
    });

    res.json({ success: true, message: "Subscription request submitted", subscription: user.subscription });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------------
// Admin approves subscription
// ------------------------
exports.approveSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.subscription.status !== "pending") {
      return res.status(400).json({ success: false, message: "No pending subscription" });
    }

    const duration = 30; // 30 days validity
    user.subscription.status = "active";
    user.subscription.startDate = new Date();
    user.subscription.endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    await user.save();

    // -------------------
    // User Notification
    // -------------------
    await UserNotification.create({
      receiver: user._id,
      type: "subscription_approved",
      message: `Your subscription for ${user.subscription.plan} has been approved`,
      link: "/user/subscription"
    });

    res.json({ success: true, message: "Subscription approved", subscription: user.subscription });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------------
// Admin rejects subscription
// ------------------------
exports.rejectSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.subscription.status !== "pending") {
      return res.status(400).json({ success: false, message: "No pending subscription" });
    }

    user.subscription.status = "rejected";
    await user.save();

    // -------------------
    // User Notification
    // -------------------
    await UserNotification.create({
      receiver: user._id,
      type: "subscription_rejected",
      message: `Your subscription request for ${user.subscription.plan} has been rejected`,
      link: "/user/subscription"
    });

    res.json({ success: true, message: "Subscription rejected" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Admin get subscription
exports.getAllSubscriptionRequests = async (req, res) => {
  try {
    const users = await Users.find({})
      .select("name email subscription");

    res.json({ success: true, requests: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// একজন ইউজার তার নিজের চলমান সাবস্ক্রিপশন প্ল্যান দেখবে
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await Users.findById(userId).select("subscription");

    if (!user || !user.subscription || user.subscription.status === "none") {
      return res.json({
        success: true,
        subscription: null,
        message: "No active subscription found",
      });
    }

    res.json({ success: true, subscription: user.subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ✅ Get All Plans (User Panel এ দেখাবে)
exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update Plan (Admin)

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await SubscriptionPlan.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Plan (Admin)
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);
    if (!deletedPlan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};