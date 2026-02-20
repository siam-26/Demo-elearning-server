const { Schema, model, Types } = require("mongoose");

const CompanyVerificationSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyRegistrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    companyType: {
      type: String,
      required: true,
    },
    taxId: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    website: {
      type: String,
      default: null,
    },
    owner: {
      type: String,
    },
    description: {
      type: String,
    },
    businessLicense: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verificationDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);



const CompanyVerification = model("CompanyVerification", CompanyVerificationSchema);
module.exports = CompanyVerification;
