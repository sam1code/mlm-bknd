const Client = require("../../models/client");
const mongoose = require("mongoose");
const redisClient = require("../../connections/redisConnect");

exports.blockUser = async (req, res, next) => {
  const { id } = req.body;

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const client = await Client.findById(id);

    if (!client) {
      return next(new Error("CLIENT_NOT_FOUND"));
    }

    await Client.deleteOne({
      _id: id,
    }).session(session);

    await Client.updateMany({ parentId: id }, { parentId: null }).session(
      session
    );

    await redisClient.del("fullTree");

    await session.commitTransaction();

    res.status(200).json({
      message: "User blocked successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
