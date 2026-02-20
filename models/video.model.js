const { Schema, model } = require("mongoose");

const videoUploadSchema = new Schema({
  videoUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true, // Cloudinary public_id রাখতে হবে replace করার জন্য
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });


const VideoUpload = model("VideoUpload", videoUploadSchema);
module.exports = VideoUpload;