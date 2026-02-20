const { Schema, model } = require("mongoose");

const socialLinkSchema = new Schema({
  telegram: {
    type: String,
    // required: true
  },
  whatsapp: {
    type: String,
    // required: true
  },
  messenger: {
    type: String,
    // required: true
  },
  showDefault: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Social = model("SocialLink", socialLinkSchema);
module.exports = Social;
