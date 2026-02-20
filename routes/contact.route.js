const router = require("express").Router();
const {  createMessage,
  getAllMessages,
  deleteMessage,
  resolveMessage, } = require("../controllers/contact.controller");




router.post("/create", createMessage);
router.get("/show", getAllMessages);
router.delete("/remove/:id", deleteMessage);
router.patch("/:id/resolve", resolveMessage);

module.exports = router;
