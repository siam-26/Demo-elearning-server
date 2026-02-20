const Message = require("../models/message.model");

// services/message.service.js
;

exports.createMessage = async ({ senderId, receiverId, text }) => {
  const message = await Message.create({ sender: senderId, receiver: receiverId, text });
  return message;
};

exports.markSeen = async (messageId) => {
  const msg = await Message.findByIdAndUpdate(messageId, { seen: true }, { new: true });
  return msg;
};

exports.getMessagesBetween = async (userId1, userId2) => {
  return Message.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 },
    ]
  }).sort({ createdAt: 1 });
};

