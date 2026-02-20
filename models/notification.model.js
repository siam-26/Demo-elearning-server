const { Schema, model } = require("mongoose");

const userNotificationSchema = new Schema(
  {
    receiver: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "Users" }, // 🆕 কে পাঠালো
    type: { type: String, required: true }, // "gallery_request", "subscription_approved" ইত্যাদি
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "none"],
      default: "none", // 🆕 রিকোয়েস্ট টাইপ না হলে none থাকবে
    },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);


const UserNotification = model("UserNotification", userNotificationSchema);
module.exports = UserNotification;