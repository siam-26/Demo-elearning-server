const verifyToken = require("../utils/verifyToken");

const isLoggedIn = async (req, res, next) => {
  // get token from header
  const headerObj = req.headers;
  const token = headerObj.authorization.split(" ")[1];
  // verify token
  const verify = await verifyToken(token);
  if (verify) {
    req.userAuth = verify;
    next();
  } else {
    res.status(400).json({
      status: "failed",
      message: "Invalid/expired token",
    });
  }
  //save user to user.obj
};
module.exports = isLoggedIn;