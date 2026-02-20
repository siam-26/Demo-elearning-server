

const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// ⚡ io inject করার জায়গা রাখবো এখানে
app.use((req, res, next) => {
  if (req.app.get("io")) {
    req.io = req.app.get("io");
  }
  next();
});

// Routes
app.use("/api/v1/admin", require("../routes/admin.route"));
app.use("/api/v1/admin/course", require("../routes/course.route"));
// app.use("/api/v1/user", require("../routes/user.route"));
// app.use("/api/v1/messages", require("../routes/message.route"));
// app.use("/api/v1/tickets", require("../routes/ticket.route"));
// app.use("/api/v1/subscription", require("../routes/subscription.route"));
// app.use("/api/v1/admin-notification", require("../routes/adminNotification.route"));
// app.use("/api/v1/payment",require("../routes/payment.route"));
// app.use("/api/v1/gallery", require("../routes/notification.route"));
// Welcome route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Invalid route
app.all("*", (req, res) => {
  res.send("Invalid route");
});

module.exports = app;
