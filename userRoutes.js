const User = require("./models/User2.model");

// এই রুটটি কল করলে সব ইউজার ডিলিট হয়ে যাবে
router.delete("/delete-all-users-dangerously", async (req, res) => {
  try {
    await User.deleteMany({}); // {} মানে সব ডাটা ডিলিট হবে
    res.status(200).json({ success: true, message: "All users deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
