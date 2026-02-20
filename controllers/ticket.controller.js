const Ticket = require("../models/ticket.model");

// Create new ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, message, userId } = req.body; // userId frontend থেকে পাঠানো
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const ticket = await Ticket.create({ user: userId, subject, message });
    res.status(201).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all tickets for a user
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.params.userId; // route থেকে নেওয়া হবে
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// controller
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Get single ticket by id
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("replies.sender", "name email");
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reply to ticket
exports.replyTicket = async (req, res) => {
  try {
    const { userId, message } = req.body; // frontend থেকে পাঠানো
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    // senderType detect
    const senderType = req.body.isAdmin ? "Admin" : "User"; // frontend থেকে isAdmin পাঠাতে হবে

    ticket.replies.push({
      senderType,
      sender: userId,
      message
    });

    await ticket.save();
    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update ticket status (Admin)
exports.updateTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
