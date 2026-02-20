const { Schema, model } = require("mongoose");

const adminNotificationSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "Users" }, // কে request করলো
    type: { type: String, required: true }, // যেমন: "subscription_request"
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const AdminNotification = model("AdminNotification", adminNotificationSchema);
module.exports = AdminNotification;