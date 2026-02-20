const { Schema, model } = require("mongoose");

const logoSchema = new Schema({
  logoUrl: {
    type: String,
    required: true,
  },
  showDefault: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });


const LogoC = model("Logo", logoSchema);
module.exports = LogoC;