require("dotenv").config();
const mongoose = require("mongoose");
const app = require("../app");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGODB_URL, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  isConnected = true;
};

module.exports = async (req, res) => {
  try {
    await connectDB();

    return app(req, res);
  } catch (error) {
    console.error("Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Database connection failed",
        message: "Could not connect to MongoDB",
      });
    }
  }
};
