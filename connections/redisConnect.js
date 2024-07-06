const redis = require("redis");

const uri = process.env.REDIS_URL;
const client = redis.createClient({
  url: uri,
});
client.on("error", (err) => {
  console.log("Error " + err);
});

client.on("connect", () => {
  console.log("Redis client connected");
});

module.exports = client;
