const { MongoClient } = require("mongodb");
const logger = require("./logger");

let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URL);
    db = client.db();
    console.log("Database connected");
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

const getDB = () => db;

module.exports = { connectDB, getDB };
