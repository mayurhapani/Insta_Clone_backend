const mongoose = require("mongoose");

const db = async () => {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("Database Connected Successfully");
};

module.exports = db;
