// routes/subscription.routes.js
const express = require("express");
const { createPlan, requestSubscription, approveSubscription, getPlans, updatePlan, deletePlan, getAllSubscriptionRequests, rejectSubscription, getMySubscription } = require("../controllers/subscription.controller");


const router = express.Router();

// Admin creates plans
router.post("/plan", createPlan);

// User requests a subscription
router.post("/request", requestSubscription);

// Admin approves subscription
router.post("/active", approveSubscription);

// Admin rejects subscription
router.post("/rejected", rejectSubscription);

// All users can view plans
router.get("/", getPlans);

// All subscription req can view Admin
router.get("/all", getAllSubscriptionRequests);
// ইউজার নিজের সাবস্ক্রিপশন প্ল্যান দেখবে
router.get("/me",  getMySubscription);
// Admin updates a plan
router.put("/:id", updatePlan);

// Admin deletes a plan
router.delete("/:id", deletePlan);

module.exports = router;
