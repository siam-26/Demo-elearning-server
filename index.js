


// const http = require("http");
// const app = require("./app/app");
// const express = require("express");
// const socketIo = require("socket.io") // Added socket.io
// const multer = require("multer") // Added multer for file uploads
// require("./db/dbConnect");

// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//   origin: [
//   process.env.CLIENT_URL,
//   "http://localhost:5174",
//   "http://localhost:5173"
// ],

//     methods: ["GET", "POST"],
//   },
// })

// app.use((req, res, next) => {
//   req.io = io
//   next()
// })

// const upload = multer({ dest: "uploads/" })
// app.use("/uploads", express.static("uploads"))


// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id)

//   // Join user to their own room for private messages
//   socket.on("join", (userId) => {
//     socket.join(userId.toString())
//     console.log(`User ${userId} joined their room`)
//   })

//   // Handle typing indicators
//   socket.on("typing", (data) => {
//     socket.to(data.receiverId.toString()).emit("userTyping", {
//       senderId: data.senderId,
//       isTyping: data.isTyping,
//     })
//   })

//   // Handle message read status
//   socket.on("messageRead", (data) => {
//     socket.to(data.senderId.toString()).emit("messageReadUpdate", {
//       messageId: data.messageId,
//       readAt: new Date(),
//     })
//   })

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id)
//   })
// })


// const port = process.env.PORT || 3000;
// server.listen(port, () => console.log(`Server running on ${port}`));
// index.js
const { Server } = require("socket.io");
const http = require("http");
const multer = require("multer");
const express = require("express");
const app = require("./app/app");
// const User = require("./models/user1.model");
require("./db/dbConnect");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:5174",
       "http://localhost:5173",
      "http://www.localhost:5173",
       "https://bibahashaadi.com", 
        "https://www.bibahashaadi.com", 
    ],
    methods: ["GET", "POST"],
  },
});

// ⚡ io কে globally app এ store করো
app.set("io", io);

// File uploads
const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static("uploads"));

// Socket.io events
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log(`✅ User ${userId} joined their private room`);
  });

  socket.on("typing", (data) => {
    socket.to(data.receiverId.toString()).emit("userTyping", {
      senderId: data.senderId,
      isTyping: data.isTyping,
    });
  });

  socket.on("messageRead", (data) => {
    socket.to(data.senderId.toString()).emit("messageReadUpdate", {
      messageId: data.messageId,
      readAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const port = process.env.PORT || 3000;

// app.get("/clean-db", async (req, res) => {
//   try {
//     const result = await User.deleteMany({});
//     res.status(200).send(`
//       <h1>Database Cleaned!</h1>
//       <p>Deleted ${result.deletedCount} users.</p>
//       <p>এখন Postman দিয়ে প্রথম (Seed) ইউজার তৈরি করুন।</p>
//     `);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
