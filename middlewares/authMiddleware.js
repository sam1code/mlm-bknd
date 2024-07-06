const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authorization = req.header("Authorization");

  const token =
    authorization && authorization.startsWith("Bearer")
      ? authorization.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).send({ success: false, message: "Access Denied" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (!err) {
      if (decoded.isAdmin !== true) {
        req.user = decoded;
      } else {
        req.admin = decoded;
      }
      next();
    } else {
      return next(new Error("INVALID_TOKEN"));
    }
  });
};

module.exports = authMiddleware;
