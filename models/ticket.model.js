const { Schema, model } = require("mongoose");

// Ticket Schema
const ticketSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true }, // যিনি টিকেট তৈরি করেছেন
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    replies: [
      {
        senderType: { type: String, enum: ["Users", "Admin"], required: true }, // কোন type reply করছে
        sender: { type: Schema.Types.ObjectId, required: true, refPath: "senderType" },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Ticket = model("Ticket", ticketSchema);
module.exports = Ticket;
