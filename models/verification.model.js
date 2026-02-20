const { Schema, model, Types } = require("mongoose");

const VerificationRequestSchema =  new Schema(
  {
    reportId: {   type: Schema.Types.ObjectId, ref: 'FraudReport', required: true },
    userId: {   type: Schema.Types.ObjectId, ref: 'Users', required: true },
    status: {
      type: String,
      enum: ['Pending', 'Withdrawn', 'Reviewed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);




const VerificationRequest = model("VerificationRequest", VerificationRequestSchema);
module.exports = VerificationRequest;