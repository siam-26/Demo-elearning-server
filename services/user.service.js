const dotenv = require('dotenv');

const Users = require('../models/user.model');


dotenv.config();

exports.createUserIntoDB = async (payload) => {
  const user = await Users.findOne({ number: payload.number });
  if (user) {
    throw new Error('User already exists with this number');
  }

  const result = await Users.create(payload);
  return result;
};

exports.updateUserIntoDB = async (id, info) => {
  const result = await Users.findByIdAndUpdate(
    id,
    { $set: info },
    { new: true },
  );
  return result;
};

exports.getUserIntoDB = async () => {
  // সব user নিয়ে আসব
  let users = await Users.find()
    .select("name dob zilla createdAt photo phone address _id division country") // সব দরকারি ফিল্ড এখানে দাও
    .lean(); // lean() দিলে object manipulate করা সহজ হয়

  // প্রত্যেক user এর জন্য filled field count বের করব
  users = users.map(user => {
    // photo থাকা না থাকার flag
    const hasPhoto = user.photo ? 1 : 0;

    // কতগুলো field ফিল্ড filled আছে সেটা গণনা
    let filledCount = 0;
    for (const key in user) {
      if (user[key] !== null && user[key] !== undefined && user[key] !== "") {
        filledCount++;
      }
    }

    return {
      ...user,
      hasPhoto,
      filledCount
    };
  });

  // sorting: আগে photo আছে → filledCount desc → createdAt desc
  users.sort((a, b) => {
    if (b.hasPhoto !== a.hasPhoto) return b.hasPhoto - a.hasPhoto; // photo থাকা আগে
    if (b.filledCount !== a.filledCount) return b.filledCount - a.filledCount; // বেশি field filled আগে
    return new Date(b.createdAt) - new Date(a.createdAt); // latest আগে
  });

  return users;
};



// service
exports.getSingleUserByIdIntoDB = async (id) => {
  return await Users.findById(id);
};
exports.deleteSingleUserByIdIntoDB = async (id) => {
  const result = await Users.findByIdAndDelete(id);
  return result;
};


exports.userLoginServices = async (payload) => {
  const { numberOrEmail, password } = payload;

  if (!numberOrEmail || !password) {
    return { status: false, message: "Number or Email and password are required" };
  }

  // Email বা Number এর যেকোনো একটা দিয়ে ইউজার খোঁজা
  const user = await Users.findOne({
    $or: [{ number: numberOrEmail }, { email: numberOrEmail }]
  });

  if (!user) {
    return { status: false, message: "No user found with this number or email." };
  }

  // পাসওয়ার্ড মেলানো
  if (user.password !== password) {
    return { status: false, message: "Incorrect password." };
  }

  return {
    status: true,
    message: "Login successful",
    data: user
  };
};

  

exports.changePasswordDB = async (id, payload) => {
  const user = await Users.findById(id);
  if (user.password != payload.currentPassword) {
    throw new Error('Current password does not match');
  }

  const updatedUser = await Users.findByIdAndUpdate(
    id,
    { password: payload.newPassword },
    { new: true },
  );
  return updatedUser;
};

// Remove interest
exports.removeInterestService = async (userId, targetUserId) => {
  const user = await Users.findById(targetUserId);
  if (!user) throw new Error("Target user not found");

  user.interestedUsers = user.interestedUsers.filter(
    (id) => id.toString() !== userId.toString()
  );

  await user.save();
  return user;
};