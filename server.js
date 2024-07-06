const app = require("./app");
const error = require("./middlewares/error.js");
const mongoConnect = require("./connections/mongoConnect.js");
const redisClient = require("./connections/redisConnect.js");

const NODEPORT = process.env.PORT || 8080;

(async () => {
  // error middleware
  app.use(error);

  // connect to mongoDB
  await mongoConnect();
  await redisClient.connect();

  app.listen(NODEPORT, () => {
    console.log("Server is running on port " + NODEPORT);
  });
})();
