const mongoose = require("mongoose");
const app = require("../app.js");

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(process.env.MONGODB_URL, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
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
        message: error.message,
      });
    }
  }
};
