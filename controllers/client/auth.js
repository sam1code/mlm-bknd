const User = require("../../models/client");
const { generateJWT } = require("../../utils/generateJWT");
const mongoose = require("mongoose");
const redisclient = require("../../connections/redisConnect");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, referralToken, joiningAmount } = req.body;

    if (!email || !password || !name) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const existingClient = await User.findOne({ email });

    if (existingClient) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let user = {
        email,
        password,
        name,
        joiningAmount,
        coin: joiningAmount * 0.1,
      };

      if (referralToken) {
        let referrer = await User.find({
          refferalToken: referralToken,
        }).session(session);

        if (referrer && referrer.length > 0) {
          if (referrer.length > 1) {
            throw new Error("INVALID_REFERRAL_TOKEN");
          }

          referrer = referrer[0];

          const isAlreadyReferred = await User.exists({
            parentId: referrer._id,
          });

          user.parentId = referrer._id;
          if (!isAlreadyReferred || isAlreadyReferred === null) {
            referrer.level = referrer.level + 1;
            referrer.levelCoin = referrer.levelCoin + (referrer.level - 1) * 10;
          }
          referrer.refferalCoin = referrer.refferalCoin + joiningAmount * 0.05;

          await referrer.save({ session });

          const incrementParentLevels = async (parentId, max) => {
            const parent = await User.findById(parentId).session(session);

            if (parent) {
              if (!isAlreadyReferred || isAlreadyReferred === null) {
                parent.level += 1;
                parent.levelCoin = parent.levelCoin + (parent.level - 1) * 10;
              }
              if (max === 2) {
                parent.refferalCoin =
                  parent.refferalCoin + joiningAmount * 0.02;
                max = 1;
              }
              if (max === 1) {
                parent.refferalCoin =
                  parent.refferalCoin + joiningAmount * 0.01;
                max = 0;
              }

              await parent.save({ session });
              await incrementParentLevels(parent.parentId);
            }
          };

          await incrementParentLevels(referrer.parentId, 2);
        }
      }

      await redisclient.del("fullTree");
      let newUser = await User.create([user], { session });
      newUser = newUser[0];

      const tokens = generateJWT({
        id: newUser._id.toString(),
        isAdmin: false,
      });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        tokens,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      next(new Error("INVALID_CREDENTIALS"));
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      next(new Error("INVALID_CREDENTIALS"));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      next(new Error("INVALID_CREDENTIALS"));
    }

    const tokens = generateJWT({
      id: user._id.toString(),
      isAdmin: false,
    });

    res.status(200).json({ tokens });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.token = async (req, res, next) => {
  try {
    console.log("I am here");
    const refreshToken = req.headers["x-refresh-token"];

    if (!refreshToken) {
      return next(new Error("INVALID_TOKEN"));
    }
    console.log("refreshToken", refreshToken);
    const token = await redisclient.get(refreshToken);

    if (!token) {
      return next(new Error("INVALID_TOKEN"));
    }

    console.log("token", token);

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        console.log("decoded", decoded);
        if (!err) {
          await redisclient.del(refreshToken);
          const tokens = generateJWT({
            id: decoded.id,
            isAdmin: false,
          });

          res.status(200).json({ tokens });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return next(new Error());
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.headers["x-refresh-token"];

    await redisclient.del(refreshToken);
  } catch (error) {
    return next(new Error());
  }
};
