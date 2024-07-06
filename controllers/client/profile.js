const Client = require("../../models/client");
const redisClient = require("../../connections/redisConnect");

exports.getClientProfile = async (req, res, next) => {
  const { id } = req.user;

  try {
    const client = await Client.findById(id);

    if (!client) {
      return next(new Error("CLIENT_NOT_FOUND"));
    }

    const tree = await client.getProfileTree();

    res.status(200).json({
      client: {
        ...client.toObject(),
        tree,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
