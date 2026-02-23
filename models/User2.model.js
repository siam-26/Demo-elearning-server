const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    referenceNo: {
      type: String,
      unique: true,
      default: function () {
        return (
          "REF" +
          Date.now().toString().slice(-6) +
          Math.floor(1000 + Math.random() * 9000)
        );
      },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User2", userSchema);

module.exports = User;
