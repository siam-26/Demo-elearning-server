
const { Schema, model } = require("mongoose");

const subscriptionPlanSchema = new Schema({
  name: {
    type: String,
    enum: ["basic", "bronze", "gold", "platinum"],
    required: true,
    unique: true,
  },
  smsLimit: { type: Number, required: true },

  interestLimit: { type: Number, required: true }, // কতজনকে interest দিতে পারবে
  price: { type: Number, required: true },
  durationInDays: { type: Number, default: 30 }, // কতদিনের package
    tag: {
    type: [String], // array of strings
    default: [],    // optional: default empty array
  },

});



const SubscriptionPlan = model("SubscriptionPlan", subscriptionPlanSchema);
module.exports = SubscriptionPlan;