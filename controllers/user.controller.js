const Users = require("../models/user.model");
const mongoose = require("mongoose");

const {
  changePasswordDB,
  createUserIntoDB,
  deleteSingleUserByIdIntoDB,
  getSingleUserByIdIntoDB,
  getUserIntoDB,
  updateUserIntoDB,
  userLoginServices,
  removeInterestService,
} = require("../services/user.service");

exports.createUser = async (req, res) => {
  try {
    const payload = req.body;
    const data = await createUserIntoDB(payload);

    return res.status(201).json({
      status: true,
      message: "User created successfully",
      data,
    });
  } catch (error) {
    // ✅ DUPLICATE KEY ERROR (robust check)
    if (error?.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return res.status(409).json({
        status: false,
        message: `${field} ইতিমধ্যে ব্যবহার করা হয়েছে`,
      });
    }

    // ✅ VALIDATION ERROR
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: false,
        message: Object.values(error.errors)[0].message,
      });
    }

    // ❌ REAL SERVER ERROR
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const payload = req.body;
    const data = await userLoginServices(payload);
    res.json(data);
  } catch (error) {
    console.error("Login error:", error); // 🔍 Add this!
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const data = await changePasswordDB(id, payload);
    console.log(data);
    res.json({
      status: true,
      message: "Password Changed successfully",
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Password is not  Changed successfully",
      error,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const data = await updateUserIntoDB(id, payload);
    res.json({
      status: true,
      message: "User updated successfully",
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "User is not updated successfully",
      error,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteSingleUserByIdIntoDB(id);
    res.json({
      status: true,
      message: "User deleted successfully",
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "User is not deleted successfully",
      error,
    });
  }
};

// Get all users with optional filters
exports.getUsers = async (req, res) => {
  try {
    const {
      gender,
      minAge,
      maxAge,
      partnerPreferences,
      country,
      maritalStatus,
      biyeDate,
      religion,
      partnerProfession,
    } = req.query;

    let query = {};
    if (gender) query.gender = gender;
    if (country) query.country = country;
    if (maritalStatus) query.maritalStatus = maritalStatus;
    if (biyeDate) query.biyeDate = biyeDate;
    if (partnerProfession) query.partnerProfession = partnerProfession;
    if(religion) query.religion = religion;
    if (partnerPreferences)
      query.partnerPreferences = { $all: partnerPreferences.split(",") };
    // Age filter
    if (minAge || maxAge) {
      query.dob = {};
      const today = new Date();
      if (minAge)
        query.dob.$lte = new Date(
          today.getFullYear() - minAge,
          today.getMonth(),
          today.getDate(),
        );
      if (maxAge)
        query.dob.$gte = new Date(
          today.getFullYear() - maxAge,
          today.getMonth(),
          today.getDate(),
        );
    }

    const users = await Users.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getSingleUserByIdIntoDB(id);

    if (!user) {
      return res.json({
        status: false,
        message: "User not found",
      });
    }

    res.json({
      status: true,
      message: "User get successfully",
      data: user,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "User is not get successfully",
      error: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const data = await getUserIntoDB();
    res.json({
      status: true,
      message: "User get successfully",
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: "User is not get successfully",
      error,
    });
  }
};

// Add Interest
exports.addInterested = async (req, res) => {
  try {
    const { userId, targetId } = req.body;

    // user যাকে পছন্দ করেছে → তার interestedUsers এ targetId যাবে
    await Users.findByIdAndUpdate(userId, {
      $addToSet: { interestedUsers: targetId },
    });

    // এবং target user এর interestedBy তে userId যাবে
    await Users.findByIdAndUpdate(targetId, {
      $addToSet: { interestedBy: userId },
    });

    res.json({ success: true, message: "Interest added successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { userId, targetId } = req.body;

    await Users.findByIdAndUpdate(userId, {
      $addToSet: { favoritedUsers: targetId },
    });

    res.json({ success: true, message: "User added to favorite list" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// ✅ নিজের তালিকা দেখা
exports.getMyLists = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId)
      .populate("interestedUsers", "name number photo _id") // শুধু দরকারি ফিল্ড আনলাম
      .populate("favoritedUsers", "name number photo _id");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      interestedUsers: user.interestedUsers,
      favoritedUsers: user.favoritedUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ❌ Favorite থেকে রিমুভ
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, targetId } = req.params;

    await Users.findByIdAndUpdate(userId, {
      $pull: { favoritedUsers: targetId }, // লিস্ট থেকে targetId বাদ দিবে
    });

    res.json({ success: true, message: "User removed from favorite list" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📌 Profile view tracker
exports.trackProfileView = async (req, res) => {
  try {
    const { profileId } = req.params; // যার প্রোফাইল view হচ্ছে
    const viewerId = req.body.viewerId || null; // viewer user ID (null হলে guest)

    // IP address
    const viewerIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // profile user fetch
    const profileUser = await Users.findById(profileId);
    if (!profileUser)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });

    // যদি এই IP + viewerId আগে দেখেছে কি না check
    const alreadyViewed = profileUser.profileViews.viewedBy.some(
      (v) => v.user?.toString() === viewerId || v.ip === viewerIP,
    );

    if (!alreadyViewed) {
      // নতুন view add করা
      profileUser.profileViews.viewedBy.push({ user: viewerId, ip: viewerIP });
      profileUser.profileViews.count = profileUser.profileViews.viewedBy.length;
      await profileUser.save();
    }

    res.json({
      success: true,
      message: alreadyViewed ? "Already counted" : "Profile view tracked",
      profileViews: profileUser.profileViews.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Search users based on criteria
exports.searchUsers = async (req, res) => {
  try {
    const { gender, minAge, maxAge, country, zilla } = req.body;

    const query = { disabled: false }; // Only active users

    // Gender
    if (gender) query.gender = gender;

    // Country
    if (country) query.country = country;

    // Zilla (only if Bangladesh)
    if (country === "Bangladesh" && zilla) {
      query.zilla = zilla;
    }

    // Age filter
    if (minAge || maxAge) {
      const currentYear = new Date().getFullYear();
      const maxBirthYear = currentYear - (minAge || 18);
      const minBirthYear = currentYear - (maxAge || 80);

      query.dob = {
        $gte: new Date(minBirthYear, 0, 1),
        $lte: new Date(maxBirthYear, 11, 31),
      };
    }

    const users = await Users.find(query)
      .select(
        "name photo number email biodataEmail dob gender country zilla division educational_qualification pesha height verified",
      )
      .limit(50)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Search users error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "সার্ভার এরর হয়েছে",
        error: error.message,
      });
  }
};

// Fetch only urgent biyeDate users
exports.getUrgentBiyeDateUsers = async (req, res) => {
  try {
    const urgentUsers = await Users.find({ biyeDate: "urgent" }).select(
      "name dob zilla photo",
    );

    res.status(200).json({
      success: true,
      count: urgentUsers.length,
      users: urgentUsers,
    });
  } catch (error) {
    console.error("Fetch urgent users error:", error);
    res.status(500).json({
      success: false,
      message: "সার্ভার এরর হয়েছে",
      error: error.message,
    });
  }
};
("");
// Get user with interests
exports.getUserWithInterests = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId)
      .populate("interestedUsers", "name email _id photo zilla") // কাদের প্রতি interest দিয়েছে
      .populate("interestedBy", "name email _id photo zilla"); // কারা interest দিয়েছে

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Remove interest
// Remove Interest
exports.removeInterest = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { userId } = req.body; // frontend থেকে পাঠানো userId

    // user এর interestedUsers থেকে target remove
    await Users.findByIdAndUpdate(userId, {
      $pull: { interestedUsers: targetUserId },
    });

    // target এর interestedBy থেকে user remove
    await Users.findByIdAndUpdate(targetUserId, {
      $pull: { interestedBy: userId },
    });

    res.json({ success: true, message: "Interest removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// upload photos and video
// exports.updateGallery = async (req, res) => {
//   try {
//     const { id } = req.params; // User ID
//     const { gallery } = req.body; // { photos: [...], video: "..." }

//     if (!gallery) {
//       return res.status(400).json({
//         success: false,
//         message: "Gallery object is required",
//       });
//     }

//     // তৈরি করা update object → শুধু পাঠানো fields update হবে
//     const updateData = {};
//     if (gallery.photos) updateData["gallery.photos"] = gallery.photos;
//     if (gallery.video) updateData["gallery.video"] = gallery.video;

//     if (Object.keys(updateData).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid fields to update in gallery",
//       });
//     }

//     // DB update
//     const updatedUser = await Users.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Gallery updated successfully",
//       data: updatedUser.gallery,
//     });
//   } catch (error) {
//     console.error("Gallery update error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
exports.updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { gallery } = req.body;

    if (!gallery) {
      return res
        .status(400)
        .json({ success: false, message: "Gallery object is required" });
    }

    // ব্যাকএন্ড ভ্যালিডেশন: ৫টির বেশি ছবি কি না চেক
    if (gallery.photos && gallery.photos.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 photos allowed",
      });
    }

    const updateData = {};
    if (gallery.photos) updateData["gallery.photos"] = gallery.photos;
    if (gallery.video !== undefined)
      updateData["gallery.video"] = gallery.video;

    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Gallery updated successfully",
      data: updatedUser.gallery,
    });
  } catch (error) {
    console.error("Gallery update error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// প্রোফাইল ফটোর প্রাইভেসী আপডেট করার কন্ট্রোলার
exports.updateProfilePhotoPrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { privacy } = req.body; // frontend থেকে 'public' অথবা 'hide' আসবে

    if (!['public', 'hide'].includes(privacy)) {
      return res.status(400).json({
        status: false,
        message: "Invalid privacy value. Use 'public' or 'hide'.",
      });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { $set: { profilePhotoPrivacy: privacy } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: `Profile photo is now ${privacy}`,
      data: {
        profilePhotoPrivacy: updatedUser.profilePhotoPrivacy
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};




// Remove uploaded document (NID / Biodata PDF)
exports.removeUserDocument = async (req, res) => {
  try {
    const { id } = req.params; // user id
    const { field } = req.body; // "nidImage" বা "biodataPdf"

    if (!["nidImage", "biodataPdf"].includes(field)) {
      return res.status(400).json({
        status: false,
        message: "Invalid field. Use 'nidImage' or 'biodataPdf'.",
      });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { $set: { [field]: "" } }, // empty string দিয়ে remove
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: `${field} সফলভাবে ডিলিট হয়েছে`,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// User verification request controller
exports.requestVerification = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find user
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent duplicate requests
    if (user.verificationStatus === "pending") {
      return res
        .status(400)
        .json({ message: "Verification request already sent" });
    }
    if (user.verificationStatus === "verified") {
      return res.status(400).json({ message: "User already verified" });
    }

    // Update verificationStatus to "pending"
    user.verificationStatus = "pending";
    await user.save();

    return res.status(200).json({
      message: "Verification request sent successfully",
      verificationStatus: user.verificationStatus,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// গ্যালারি (পার্সোনাল ফটো ও ভিডিও) প্রাইভেসী আপডেট
// exports.updateGalleryPrivacy = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { privacy } = req.body;

//     const updatedUser = await Users.findByIdAndUpdate(
//       id,
//       { $set: { gallaryPrivacy: privacy } },
//       { new: true },
//     );

//     res.status(200).json({
//       status: true,
//       message: `গ্যালারি এখন ${privacy === "public" ? "পাবলিক" : "হাইড"} করা হয়েছে`,
//       data: updatedUser.gallaryPrivacy,
//     });
//   } catch (error) {
//     res.status(500).json({ status: false, error: error.message });
//   }
// };