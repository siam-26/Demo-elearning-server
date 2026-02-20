const router = require("express").Router();

const {
  createUser,
  loginUser,
  changePassword,
  updateUser,
  deleteUser,
  getSingleUser,
  getUser,
  addInterested,
  addFavorite,
  getMyLists,
  removeFavorite,
  trackProfileView,
  searchUsers,
  getUserWithInterests,
  removeInterest,
  getUsers,
  getUrgentBiyeDateUsers,
  updateGallery,
  updateProfilePhotoPrivacy,
  updateGalleryPrivacy,
  removeUserDocument,
  requestVerification,
} = require("../controllers/user.controller");

const nodemailer = require("nodemailer");
const Users = require("../models/user.model"); // তোমার ইউজার মডেল
const bcrypt = require("bcryptjs");

// OTP স্টোর করার জন্য একটা ইন-মেমোরি স্টোর (production এ Redis বা DB use করো)
const otpStore = {};

// Nodemailer সেটআপ
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME, // তোমার Gmail
    pass: process.env.EMAIL_APP_PASSWORD, // Gmail app password
  },
});


// Create and Login
router.post('/create', createUser); // POST /users
router.post('/login', loginUser); // POST /users/login

// Password change
router.post('/change-password/:id', changePassword);


// 1) OTP পাঠানোর API
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await Users.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // 6 ডিজিটের OTP জেনারেট
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // OTP স্টোর (expiry 5 মিনিট)
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  // OTP ইমেইল পাঠাও
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "ScamBD Password Reset - Your One Time OTP Code",

text: `Hello,

We received a request to reset your password on ScamBD.

Your One-Time Password (OTP) is: ${otp}

This OTP will expire in 5 minutes. Please do not share it with anyone.

If you did not request this, please ignore this email or contact us.

Visit: https://scambd.com

- ScamBD Team
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

// 2) OTP ভেরিফাই এবং পাসওয়ার্ড রিসেট API
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmPassword)
    return res.status(400).json({ message: "All fields are required" });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  const storedOTP = otpStore[email];
  if (!storedOTP)
    return res.status(400).json({ message: "OTP not found or expired" });

  if (storedOTP.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  if (storedOTP.expires < Date.now())
    return res.status(400).json({ message: "OTP expired" });

  // ইউজার পাসওয়ার্ড আপডেট করো (হ্যাশ বাদ দিয়ে সরাসরি)
  await Users.updateOne({ email }, { password: newPassword });

  // OTP মুছে ফেলো
  delete otpStore[email];

  res.json({ message: "Password reset successful" });
});



// Read
router.get('/', getUser); // GET /users
router.get('/all', getUsers); // GET /users
router.get('/urgent', getUrgentBiyeDateUsers); // GET /users urgent
router.get('/:id', getSingleUser); // GET /users/:id
router.post("/interested", addInterested);
// :profileId হলো যেই প্রোফাইল দেখানো হচ্ছে
router.post("/:profileId/view", trackProfileView);
// Search users
router.post("/search", searchUsers)
router.post("/favorite", addFavorite);
router.get("/:userId/interests", getUserWithInterests);
router.get("/:userId/lists", getMyLists); 
// Update
router.patch('/:id', updateUser); // PATCH /users/:id
router.put('/:id', updateUser);   // Optional if full update supported


// Update gallery
router.patch("/:id/gallery", updateGallery); // PATCH /users/:id/gallery

router.patch("/:id/profilephoto-privacy", updateProfilePhotoPrivacy);

// router.patch("/:id/gallery-privacy", updateGalleryPrivacy);

// Delete uploaded document
router.patch("/remove-document/:id", removeUserDocument);

//user verification pending
router.patch("/verification-request/:id", requestVerification);



// Delete
router.delete("/:targetUserId/interest",  removeInterest);
router.delete('/:id', deleteUser); // DELETE /users/:id
// ❌ ফেভারিট থেকে রিমুভ
router.delete("/:userId/favorite/:targetId", removeFavorite);
module.exports = router;
