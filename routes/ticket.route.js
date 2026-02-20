const { createTicket, getUserTickets, getTicketById, replyTicket, updateTicketStatus } = require("../controllers/ticket.controller");

const router = require("express").Router();
// User creates a ticket
router.post("/",  createTicket);

// Get all tickets of logged in user
router.get("/",  getUserTickets);

router.get("/:userId",  getUserTickets);
// Get single ticket by id
router.get("/single/:id",  getTicketById);


// Reply to a ticket
router.post("/:id/reply", replyTicket);

// Update ticket status (Admin only)
router.patch("/:id/status",  updateTicketStatus);

module.exports = router;
