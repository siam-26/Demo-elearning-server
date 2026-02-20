const { Schema, model } = require("mongoose")

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === "text"
      },
    },
    mediaUrl: {
      type: String,
      required: function () {
        return this.messageType === "image" || this.messageType === "video"
      },
    },
    mediaPublicId: {
      // Cloudinary public ID for deletion
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 })

const Message = model("Message", messageSchema)
module.exports = Message
