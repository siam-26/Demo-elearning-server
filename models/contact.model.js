const { Schema, model, Types } = require("mongoose");
// Define the schema for the contact form
const contactSchema = new Schema({
  name: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    resolve: {
      type: Boolean,
      default: false,
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model from the schema
const Contact = model('Contact', contactSchema);
module.exports = Contact;

