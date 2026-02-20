const express = require("express")
const multer = require("multer")
const {
  sendMessage,
  sendMediaMessage,
  getConversation,
  getConversations,
  getSmsUsage,
} = require("../controllers/message.controller")

const router = express.Router()

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" })

// Middleware to simulate authentication (replace with actual auth middleware)
const authenticateUser = (req, res, next) => {
  // For demo purposes, assuming user ID is passed in headers
  // In real app, decode JWT token here
  const userId = req.headers["user-id"]
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" })
  }
  req.user = { id: userId }
  next()
}

// Apply authentication to all routes
router.use(authenticateUser)

// Send text message
router.post("/send", sendMessage)

// Send media message (image/video)
router.post("/send-media", upload.single("media"), sendMediaMessage)

// Get conversation between two users
router.get("/conversation/:userId", getConversation)

// Get all conversations for current user
router.get("/conversations/:userId", getConversations)

// Get SMS usage info
router.get("/sms-usage", getSmsUsage)

module.exports = router
