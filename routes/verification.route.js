const { requestVerification, withdrawVerification, getPendingVerifications, reviewVerification, addAdminNote, getUserVerificationRequests, deleteVerificationRequest } = require("../controllers/verification.controller");

const router = require("express").Router();


// ইউজার দিচ্ছে verification request
router.post("/request/:reportId",requestVerification);

// ইউজার withdraw করছে
router.post("/withdraw/:reportId",withdrawVerification);

// USER ROUTE
router.get("/user-requests/:userId", getUserVerificationRequests);

// ADMIN ROUTES
router.delete("/delete/:requestId", deleteVerificationRequest);

// অ্যাডমিন দেখবে pending গুলো
router.get("/pending",getPendingVerifications);

// অ্যাডমিন approve/reject করবে
router.post("/review/:reportId",reviewVerification);

// অ্যাডমিন note add করবে
router.post("/add-note/:reportId",addAdminNote);

module.exports = router;
