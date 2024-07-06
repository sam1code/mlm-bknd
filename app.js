const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
const logger = require("express-requests-logger");

app.use(cors());
// app.use(
//   logger({
//     logger: console,
//     excludeHeaders: ["cookie", "user-agent", "accept-language"],
//     excludeBody: ["password"],
//   })
// );

// health check
app.get("/", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  res.json(healthCheck);
});

// routs for
app.use("/api", require("./routes"));

// 404
app.use("*", (req, res) =>
  res.status(404).json({
    message: "Invalid route",
    isError: true,
  })
);
module.exports = app;
