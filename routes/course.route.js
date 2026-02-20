const express = require("express");
const router = express.Router();

const {
  createCourse,
  getCourses,
} = require("../controllers/course.controller");


// post 
router.post("/add-course", createCourse);

// GET all courses
router.get("/all-courses", getCourses);

module.exports = router;
