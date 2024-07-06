const redisclient = require("../connections/redisConnect");
const jwt = require("jsonwebtoken");

exports.generateJWT = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const refreshToken = jwt.sign(data, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });

  console.log(data);

  redisclient.set(refreshToken, data.id.toString(), "EX", 60 * 60 * 24 * 1);

  return { token, refreshToken };
};
