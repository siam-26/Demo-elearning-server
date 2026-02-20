const jwt = require("jsonwebtoken");

exports.generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET_KEY, { expiresIn: "60d" });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return false;
    } else {
      return decoded;
    }
  });
};
