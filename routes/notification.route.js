const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/userNotification.controller");

// গ্যালারি রিকোয়েস্ট পাঠানোর রুট
router.post("/send-request", galleryController.sendGalleryRequest);

// একসেপ্ট বা রিজেক্ট করার রুট
router.patch("/handle-action", galleryController.handleGalleryAction);

module.exports = router;
