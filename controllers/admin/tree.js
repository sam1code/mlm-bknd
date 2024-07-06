const Client = require("../../models/client");
const redisClient = require("../../connections/redisConnect");

exports.getFullTree = async (req, res, next) => {
  try {
    const client = await Client.find({ parentId: null }).lean();

    if (!client || client.length === 0) {
      return res.status(200).json({
        tree: [],
      });
    }

    const buildFullTree = async (clients) => {
      const result = await Promise.all(
        clients.map(async (client) => {
          const children = await Client.find({ parentId: client._id }).lean();
          client.children = await buildFullTree(children);
          return client;
        })
      );

      return result;
    };

    let tree = await redisClient.get("fullTree");

    if (tree) {
      tree = JSON.parse(tree);
      return res.status(200).json({
        tree,
      });
    }

    tree = await buildFullTree(client);

    await redisClient.set("fullTree", JSON.stringify(tree));

    res.status(200).json({
      tree,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
