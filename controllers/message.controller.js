// const Message = require("../models/Message")
const mongoose = require("mongoose");
const Message = require("../models/message.model")
const Users = require("../models/user.model")

// const Users = require("../models/User")
const cloudinary = require("cloudinary").v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Send a text message
// exports.sendMessage = async (req, res) => {
   
//   try {
//     const { receiverId, content } = req.body
//     const senderId = req.user.id // Assuming user is authenticated

//     // Check if sender has SMS limit
//     const sender = await Users.findById(senderId)
//     if (!sender) {
//       return res.status(404).json({ error: "Sender not found" })
//     }

    
//     // Check SMS limit
//     if (sender.subscription.usedSms >= sender.subscription.smsLimit) {
//       return res.status(403).json({
//         error: "SMS limit exceeded. Please upgrade your subscription.",
//       })
//     }

//     // Check if receiver exists
//     const receiver = await Users.findById(receiverId)
//     if (!receiver) {
//       return res.status(404).json({ error: "Receiver not found" })
//     }

//     // Create message
//     const message = new Message({
//       sender: senderId,
//       receiver: receiverId,
//       messageType: "text",
//       content,
//     })

//     await message.save()

//     // Update sender's used SMS count
//     await Users.findByIdAndUpdate(senderId, {
//       $inc: { "subscription.usedSms": 1 },
//     })

//     // Populate sender and receiver info
//     await message.populate([
//       { path: "sender", select: "name photo" },
//       { path: "receiver", select: "name photo" },
//     ])

//     // Emit to socket for real-time
//     req.io.to(receiverId.toString()).emit("newMessage", message)

//     res.status(201).json({ message, success: true })
//   } catch (error) {
//     console.error("Send message error:", error)
//     res.status(500).json({ error: "Failed to send message" })
//   }
// }


// exports.sendMessage = async (req, res) => {
//   try {
//     const { receiverId, content } = req.body;
//     const senderId = req.user.id; // Assuming user is authenticated

//     // 1️⃣ Fetch sender
//     const sender = await Users.findById(senderId);
//     if (!sender) {
//       return res.status(404).json({ error: "Sender not found" });
//     }

//     // Initialize sentTo array if not exist
//     if (!Array.isArray(sender.subscription.sentTo)) {
//       sender.subscription.sentTo = [];
//     }

//     // 2️⃣ Fetch receiver
//     const receiver = await Users.findById(receiverId);
//     if (!receiver) {
//       return res.status(404).json({ error: "Receiver not found" });
//     }

//     // 3️⃣ Check if receiver is new
//     const isNewReceiver = !sender.subscription.sentTo.includes(receiverId);

//     // 4️⃣ SMS limit check if new receiver
//     if (isNewReceiver) {
//       if (sender.subscription.usedSms + 1 > sender.subscription.smsLimit) {
//         return res.status(403).json({
//           error: "SMS limit exceeded. Please upgrade your subscription.",
//         });
//       }

//       // Deduct 1 SMS for this new receiver
//       sender.subscription.usedSms += 1;
//       sender.subscription.sentTo.push(receiverId);
//       await sender.save();
//     }

//     // 5️⃣ Create message
//     const message = new Message({
//       sender: senderId,
//       receiver: receiverId,
//       messageType: "text",
//       content,
//     });
//     await message.save();

//     // 6️⃣ Populate sender and receiver info
//     await message.populate([
//       { path: "sender", select: "name photo" },
//       { path: "receiver", select: "name photo" },
//     ]);

//     // 7️⃣ Emit to socket safely
//     if (req.io) {
//       req.io.to(receiverId.toString()).emit("newMessage", message);
//     } else {
//       console.warn("⚠️ req.io is undefined. Socket emit skipped.");
//     }

//     // 8️⃣ Response
//     res.status(201).json({ message, success: true });
//   } catch (error) {
//     console.error("Send message error:", error);
//     res.status(500).json({ error: "Failed to send message" });
//   }
// };


// Function-ti eivabe update korun jate receiverId o filter kora jay
const checkMessageLimit = async (sender, receiverId) => {
  const sub = sender.subscription || {
    status: "none",
    usedSms: 0,
    smsLimit: 0,
  };
  const isActive = sub.status === "active";

  if (!isActive) {
    // ১. চেক করুন এই প্রেরক (sender) কতজন ইউনিক মানুষকে মেসেজ পাঠিয়েছে
    const uniqueReceivers = await Message.distinct("receiver", {
      sender: sender._id,
    });

    // ২. চেক করুন বর্তমান receiverId এই তালিকায় আছে কি না
    const alreadyMessagedThisPerson = uniqueReceivers.some(
      (id) => id.toString() === receiverId.toString(),
    );

    // ৩. যদি তালিকায় না থাকে এবং অলরেডি ৩ জন হয়ে গিয়ে থাকে
    if (!alreadyMessagedThisPerson && uniqueReceivers.length >= 3) {
      return {
        allowed: false,
        error:
          "আপনি সর্বোচ্চ ৩ জন নতুন মানুষকে ফ্রি মেসেজ পাঠাতে পারবেন। আনলিমিটেড ইউজারের সাথে কথা বলতে সাবস্ক্রাইব করুন।",
      };
    }
  } else {
    // PAID USER: গ্লোবাল লিমিট চেক (যদি আপনার প্ল্যানে লিমিট থাকে)
    if (sub.usedSms >= (sub.smsLimit || 0)) {
      return {
        allowed: false,
        error: "আপনার সাবস্ক্রিপশন লিমিট শেষ হয়ে গেছে।",
      };
    }
  }
  return { allowed: true };
};


// --- Update sendMessage (Text) ---
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user?.id;

    const sender = await Users.findById(senderId);
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    // লিমিট চেক
    const limitStatus = await checkMessageLimit(sender, receiverId);
    if (!limitStatus.allowed) {
      return res.status(403).json({ success: false, error: limitStatus.error });
    }

    // মেসেজ তৈরি ও সেভ
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      messageType: "text",
      content,
    });
    await message.save();

    // ব্যবহৃত SMS কাউন্টার আপডেট লজিক
    if (sender.subscription?.status === "active") {
      // পেইড ইউজার হলে প্রতি মেসেজেই কাউন্ট বাড়তে পারে (আপনার ইচ্ছা অনুযায়ী)
      await Users.updateOne(
        { _id: senderId },
        { $inc: { "subscription.usedSms": 1 } },
      );
    } else {
      // ফ্রি ইউজারের ক্ষেত্রে যদি এটি নতুন ইউজার হয়, তবে আপনি ট্র্যাকিং এর জন্য
      // User মডেলে usedSms বা sentTo আপডেট করতে পারেন (ঐচ্ছিক)
    }

    await message.populate([
      { path: "sender", select: "name photo" },
      { path: "receiver", select: "name photo" },
    ]);

    if (req.io) req.io.to(receiverId.toString()).emit("newMessage", message);

    res.status(201).json({ message, success: true });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};


// --- Update sendMediaMessage (Image/Video) ---
exports.sendMediaMessage = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.id;

    const sender = await Users.findById(senderId);
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    // Limit check call (Eki logic media-r jonno)
    const limitStatus = checkMessageLimit(sender);
    if (!limitStatus.allowed) {
      return res.status(403).json({ success: false, error: limitStatus.error });
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto", folder: "messages" });
    const messageType = result.resource_type === "video" ? "video" : "image";

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      messageType,
      mediaUrl: result.secure_url,
      mediaPublicId: result.public_id,
    });
    await message.save();

    // Increment usedSms (Media pathaleo count barbe)
    await Users.updateOne({ _id: senderId }, { $inc: { "subscription.usedSms": 1 } });

    await message.populate([{ path: "sender", select: "name photo" }, { path: "receiver", select: "name photo" }]);
    if (req.io) req.io.to(receiverId.toString()).emit("newMessage", message);

    res.status(201).json({ message, success: true });
  } catch (error) {
    res.status(500).json({ error: "Media send failed" });
  }
};

// exports.sendMessage = async (req, res) => {
//   try {
//     const { receiverId, content } = req.body;
//     const senderId = req.user?.id; 
//     console.log("🔹 SenderId from req.user:", senderId);

//     const sender = await Users.findById(senderId);
//     console.log("🔹 Sender fetched:", sender?._id);

//     if (!sender) return res.status(404).json({ error: "Sender not found" });

//     if (!sender.subscription) {
//       console.log("⚠️ Sender subscription missing:", sender);
//       return res.status(400).json({ error: "No subscription found" });
//     }

//     // ensure array exists
//     if (!Array.isArray(sender.subscription.sentTo)) {
//       sender.subscription.sentTo = [];
//     }

//     const receiver = await Users.findById(receiverId);
//     console.log("🔹 Receiver fetched:", receiver?._id);

//     if (!receiver) return res.status(404).json({ error: "Receiver not found" });

//     const isNewReceiver = !sender.subscription.sentTo.includes(receiverId);
//     console.log("🔹 Is new receiver?", isNewReceiver);

//     if (isNewReceiver) {
//       if (sender.subscription.usedSms + 1 > sender.subscription.smsLimit) {
//         return res.status(403).json({
//           error: "SMS limit exceeded. Please upgrade your subscription.",
//         });
//       }

//       // ✅ শুধু subscription ফিল্ড update করো, পুরো user validate করবে না
//       await Users.updateOne(
//         { _id: senderId },
//         {
//           $inc: { "subscription.usedSms": 1 },
//           $push: { "subscription.sentTo": receiverId },
//         }
//       );
//       console.log("✅ SMS count updated safely (updateOne used)");
//     }

//     // Create message
//     const message = new Message({
//       sender: senderId,
//       receiver: receiverId,
//       messageType: "text",
//       content,
//     });
//     await message.save();
//     console.log("✅ Message saved:", message._id);

//     await message.populate([
//       { path: "sender", select: "name photo" },
//       { path: "receiver", select: "name photo" },
//     ]);

//     // Emit via socket
//     if (req.io) {
//       req.io.to(receiverId.toString()).emit("newMessage", message);
//       console.log("📡 Message emitted via socket");
//     } else {
//       console.warn("⚠️ req.io is undefined. Socket emit skipped.");
//     }

//     res.status(201).json({ message, success: true });
//   } catch (error) {
//     console.error("❌ Send message error:", error);
//     res.status(500).json({ error: "Failed to send message", details: error.message });
//   }
// };



// Send media message (image/video)
// exports.sendMediaMessage = async (req, res) => {
//   try {
//     const { receiverId } = req.body
//     const senderId = req.user.id

//     // Check SMS limit
//     const sender = await Users.findById(senderId)
//     if (!sender) {
//       return res.status(404).json({ error: "Sender not found" })
//     }

//     if (sender.subscription.usedSms >= sender.subscription.smsLimit) {
//       return res.status(403).json({
//         error: "SMS limit exceeded. Please upgrade your subscription.",
//       })
//     }

//     // Check if receiver exists
//     const receiver = await Users.findById(receiverId)
//     if (!receiver) {
//       return res.status(404).json({ error: "Receiver not found" })
//     }

//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" })
//     }

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       resource_type: "auto",
//       folder: "messages",
//     })

//     // Determine message type
//     const messageType = result.resource_type === "video" ? "video" : "image"

//     // Create message
//     const message = new Message({
//       sender: senderId,
//       receiver: receiverId,
//       messageType,
//       mediaUrl: result.secure_url,
//       mediaPublicId: result.public_id,
//     })

//     await message.save()

//     // Update sender's used SMS count
//     await Users.findByIdAndUpdate(senderId, {
//       $inc: { "subscription.usedSms": 1 },
//     })

//     // Populate sender and receiver info
//     await message.populate([
//       { path: "sender", select: "name photo" },
//       { path: "receiver", select: "name photo" },
//     ])

//     // Emit to socket for real-time
//     req.io.to(receiverId.toString()).emit("newMessage", message)

//     res.status(201).json({ message, success: true })
//   } catch (error) {
//     console.error("Send media message error:", error)
//     res.status(500).json({ error: "Failed to send media message" })
//   }
// }

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate("sender", "name photo")
      .populate("receiver", "name photo")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() },
    )

    res.json({ messages: messages.reverse(), success: true })
  } catch (error) {
    console.error("Get conversation error:", error)
    res.status(500).json({ error: "Failed to get conversation" })
  }
}

// // Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    console.log("DEBUG req.params.userId =", req.params.userId);

    if (!req.params.userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    // Use 'new' for ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    console.log("DEBUG userId =", userId);

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"] },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          user: { _id: 1, name: 1, photo: 1 },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    res.json({ success: true, conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
};


exports.getSmsUsage = async (req, res) => {
  try {
    const senderId = req.user?.id;
    const user = await Users.findById(senderId).select("subscription");

    const sub = user.subscription || { status: "none", usedSms: 0 };
    const isActive = sub.status === "active";

    if (isActive) {
      return res.json({
        success: true,
        isActive: true,
        smsLimit: sub.smsLimit,
        usedSms: sub.usedSms,
        remainingSms: Math.max(0, sub.smsLimit - sub.usedSms),
      });
    } else {
      // ফ্রি ইউজার: কয়জন ইউনিক মানুষকে মেসেজ পাঠিয়েছে তা বের করা
      const uniqueReceivers = await Message.distinct("receiver", {
        sender: senderId,
      });
      const usedSlots = uniqueReceivers.length;
      const totalSlots = 3;

      return res.json({
        success: true,
        isActive: false,
        slotsLimit: totalSlots,
        usedSlots: usedSlots,
        remainingSlots: Math.max(0, totalSlots - usedSlots),
        info: "You can message 3 unique people for free.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Get user's SMS usage info
// exports.getSmsUsage = async (req, res) => {
//   try {
//     const userId = req.user.id
//     const user = await Users.findById(userId).select("subscription")

//     res.json({
//       smsLimit: user.subscription.smsLimit,
//       usedSms: user.subscription.usedSms,
//       remainingSms: user.subscription.smsLimit - user.subscription.usedSms,
//       success: true,
//     })
//   } catch (error) {
//     console.error("Get SMS usage error:", error)
//     res.status(500).json({ error: "Failed to get SMS usage" })
//   }
// }


