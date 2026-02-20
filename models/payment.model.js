// models/payment.model.js
const { Schema, model } = require("mongoose");

const paymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users", // আপনার ইউজার মডেলের নাম
      required: true,
    },
    subscriptionPlan: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan", // আপনার সাবস্ক্রিপশন প্ল্যান মডেলের নাম
      required: true,
    },
    amount: { type: Number, required: true },
    order_id: { type: String, required: true, unique: true }, // সূর্যপে-র জন্য
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    method: { type: String, default: "shurjopay" },
  },
  { timestamps: true },
);

module.exports = model("Payment", paymentSchema);
