const Admin = require("../../models/admin");
const { generateJWT } = require("../../utils/generateJWT");
const redisclient = require("../../connections/redisConnect");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return next(new Error("INVALID_CREDENTIALS"));
    }
    const user = await Admin.create({ email, password, name });
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new Error("INVALID_CREDENTIALS"));
    }

    const user = await Admin.findOne({ email });

    if (!user || !user.password) {
      return next(new Error("INVALID_CREDENTIALS"));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new Error("INVALID_CREDENTIALS"));
    }

    const tokens = generateJWT({
      id: user._id.toString(),
      isAdmin: true,
    });

    res.status(200).json({ tokens });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.token = async (req, res, next) => {
  try {
    const refreshToken = req.headers["x-refresh-token"];
    console.log("refreshToken", refreshToken);

    if (!refreshToken) {
      return next(new Error("INVALID_TOKEN"));
    }

    const token = await redisclient.get(refreshToken);

    if (!token) {
      return next(new Error("INVALID_TOKEN"));
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (!err) {
          const tokens = generateJWT({
            id: decoded.id.toString(),
            isAdmin: true,
          });

          res.status(200).json({ tokens });
        } else {
          return next(new Error("INVALID_TOKEN"));
        }
      }
    );
  } catch (error) {
    return next(new Error());
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.headers["x-refresh-token"];

    redisclient.del(refreshToken);
  } catch (error) {
    return next(new Error());
  }
};
