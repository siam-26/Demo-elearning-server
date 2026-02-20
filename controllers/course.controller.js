const Course = require("../models/course.model");

exports.createCourse = async (req, res) => {
  try {
    const { name, image, link } = req.body;

    // basic validation
    if (!name || !image || !link) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newCourse = await Course.create({
      name,
      image,
      link,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};