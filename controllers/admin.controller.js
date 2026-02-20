const Users = require("../models/user.model");
const { createAdminIntoDB, adminLoginServices, updateAdminIntoDB, deleteSingleAdminByIdIntoDB, getSingleAdminByIdIntoDB, getAdminIntoDB, dashboardOverview } = require("../services/admin.service");



exports.createAdmin = async (req, res) => {
  try {
    const payload = req.body;
    const data = await createAdminIntoDB(payload);
    res.json({
      status: true,
      message: 'User created successfully',
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: 'User is not created successfully',
      error: error.message,
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const payload = req.body;
    const data = await adminLoginServices(payload);
    res.json({
      status: true,
      message: 'Admin login successfully',
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: 'Admin is not login successfully',
      error: error.message,
    });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const data = await updateAdminIntoDB(id, payload);
    res.json({
      status: true,
      message: 'User updated successfully',
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: 'User is not updated successfully',
      error: error.message,
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteSingleAdminByIdIntoDB(id);
    res.json({
      status: true,
      message: 'User deleted successfully',
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: 'User is not deleted successfully',
      error: error.message,
    });
  }
};

exports.getSingleAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getSingleAdminByIdIntoDB(id);
    res.json({
      status: true,
      message: 'User fetched successfully',
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: 'User could not be fetched',
      error: error.message,
    });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const data = await getAdminIntoDB();
    res.json({
      status: true,
      message: 'Users fetched successfully',
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: 'Users could not be fetched',
      error: error.message,
    });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const data = await dashboardOverview();
    res.json({
      status: true,
      message: 'Dashboard data fetched successfully',
      data,
    });
  } catch (error) {
    res.json({
      status: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};


// Get all users with pagination and filtering
exports.getAllUsers = async (req, res) => {
  try {
    // Pagination
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Verification Status
    if (req.query.verificationStatus && req.query.verificationStatus !== "") {
      filter.verificationStatus = req.query.verificationStatus;
    }


    // Disabled users filter (optional)
    if (req.query.disabled !== undefined) {
      filter.disabled = req.query.disabled === "true";
    }

    // Gender filter
    if (req.query.gender) {
      filter.gender = req.query.gender;
    }

    // Marital Status filter
    if (req.query.maritalStatus) {
      filter.maritalStatus = req.query.maritalStatus;
    }

    // Search filter (name, email, number)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { number: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Fetch users from DB
    const users = await Users.find(filter)
      .select("-password") // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("interestedUsers", "name number")
      .populate("favoritedUsers", "name number");

    // Pagination info
    const totalUsers = await Users.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await Users.findById(id)
      .select("-password")
      .populate("interestedUsers", "name number email photo")
      .populate("favoritedUsers", "name number email photo")
      .populate("interestedBy", "name number email photo")
      .populate("profileViews.viewedBy.user", "name number")
      .populate("blockedUsers", "name number")
      .populate("reportedUsers.user", "name number")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update user status (verify/disable)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { verified, disabled, notes } = req.body

    const updateData = {}
    if (verified !== undefined) updateData.verified = verified
    if (disabled !== undefined) updateData.disabled = disabled
    if (notes !== undefined) updateData.notes = notes

    const user = await Users.findByIdAndUpdate(id, updateData, { new: true, select: "-password" })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "User status updated successfully",
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await Users.countDocuments()
    const verifiedUsers = await Users.countDocuments({ verified: true })
    const disabledUsers = await Users.countDocuments({ disabled: true })
    const maleUsers = await Users.countDocuments({ gender: "Male" })
    const femaleUsers = await Users.countDocuments({ gender: "Female" })

    // Subscription stats
    const subscriptionStats = await Users.aggregate([
      {
        $group: {
          _id: "$subscription.type.plan",
          count: { $sum: 1 },
        },
      },
    ])

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        disabledUsers,
        maleUsers,
        femaleUsers,
        subscriptionStats,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}



// Update verificationStatus to 'verified'
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // আপডেট করুন
    user.verificationStatus = "verified";
    user.verified = true; // যদি মডেলে এই ফিল্ড থাকে
    await user.save();

    res.json({
      success: true,
      message: "User verified successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


