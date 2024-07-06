const mongoose = require("mongoose");

const connectDatabase = async () => {
  await mongoose
    .connect(
      `${
        process.env.MONGO_URI + process.env.MONGO_DB_NAME
      }?retryWrites=true&w=majority`
    )
    .then((data) => console.log(data.connection.host));
};

module.exports = connectDatabase;
