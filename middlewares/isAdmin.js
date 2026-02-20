const responseStatus = require("../handlers/responseStatus.handler");
const User = require("../models/user.model");

const isAdmin = async (req, res, next) => {
  const userId = req.userAuth.id;
  const admin = await User.findById(userId);
  if (admin.isAdmin === true) {
    next();
  } else {
    responseStatus(res, 403, "failed", "Access Denied.admin only route!");
  }
};
module.exports = isAdmin;
