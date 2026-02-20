// import VideoUpload from "../models/VideoUpload.js";
// import cloudinary from "../config/cloudinary.js";

const VideoUpload = require("../models/video.model");

// ভিডিও আপলোড বা রিপ্লেস
exports.uploadVideo = async (req, res) => {
  try {
    const file = req.file; // multer থেকে আসবে
    if (!file) return res.status(400).json({ message: "No file provided" });

    // আগের ভিডিও থাকলে delete
    const existingVideo = await VideoUpload.findOne();
    if (existingVideo) {
      await cloudinary.uploader.destroy(existingVideo.publicId, { resource_type: "video" });
      await VideoUpload.findByIdAndDelete(existingVideo._id);
    }

    // নতুন ভিডিও cloudinary তে আপলোড
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
      folder: "videos",
    });

    const newVideo = await VideoUpload.create({
      videoUrl: result.secure_url,
      publicId: result.public_id,
      isActive: true,
    });

    res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (err) {
    res.status(500).json({ message: "Error uploading video", error: err.message });
  }
};

// ভিডিও inactive করা
exports.toggleActive = async (req, res) => {
  try {
    const video = await VideoUpload.findOne();
    if (!video) return res.status(404).json({ message: "No video found" });

    video.isActive = !video.isActive;
    await video.save();

    res.json({ message: "Video status updated", video });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err.message });
  }
};

// ভিডিও দেখা
exports.getVideo = async (req, res) => {
  try {
    const video = await VideoUpload.findOne();
    if (!video) return res.status(404).json({ message: "No video found" });

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Error fetching video", error: err.message });
  }
};
