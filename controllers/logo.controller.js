

const LogoC = require("../models/logo.model");

// একটাই logo রাখার জন্য - create করলে update হবে
exports.setOrUpdateLogo = async (req, res) => {
  try {
    const { logoUrl } = req.body;
    let logo = await LogoC.findOne();

    if (logo) {
      logo.logoUrl = logoUrl;
      await logo.save();
    } else {
      logo = await LogoC.create({ logoUrl });
    }

    res.json(logo);
  } catch (error) {
    res.status(500).json({ message: "Failed to set logo", error });
  }
};

exports.getLogo = async (req, res) => {
  try {
    const logo = await LogoC.findOne();
    res.json(logo);
  } catch (error) {
    res.status(500).json({ message: "Failed to get logo" });
  }
};
