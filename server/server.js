/* require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const podcastSchema = new mongoose.Schema({
  title: String,
  host: String,
  url: String,
  category: String,
  description: String,
  rating: Number,
  pin: String,
  createdAt: String,
  updatedAt: String,
});

const Podcast = mongoose.model("Podcast", podcastSchema);

const ADMIN_PIN = process.env.ADMIN_PIN;
const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const ALLOWED_PODCAST_DOMAINS = [
  "open.spotify.com",
  "podcasts.apple.com",
  "soundcloud.com",
  "youtube.com",
  "anchor.fm",
  "youtu.be",
];
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (
    (req.method === "DELETE" ||
      req.method === "PATCH" ||
      req.method === "POST") &&
    req.body
  ) {
    console.log(`${req.method} request body:`, JSON.stringify(req.body));
    if (req.method === "POST") {
      console.log(`Creating new podcast: ${req.body.title || "Untitled"}`);
    }
  }

  next();
});

const validateUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace("www.", "");

    const isAllowed = ALLOWED_PODCAST_DOMAINS.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      return {
        valid: false,
        error: "Unsupported podcast platform",
        details: `Allowed domains: ${ALLOWED_PODCAST_DOMAINS.join(", ")}`,
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Invalid URL format",
      details: "Please provide a valid HTTP/HTTPS URL",
    };
  }
};

const validatePin = async (pin, podcastId = null) => {
  if (!pin) return { valid: false, error: "PIN is required" };
  if (typeof pin !== "string")
    return { valid: false, error: "PIN must be a string" };
  if (!/^\d+$/.test(pin))
    return { valid: false, error: "PIN must contain only numbers" };
  if (pin.length < 4)
    return { valid: false, error: "PIN must be at least 4 digits" };

  if (podcastId) {
    if (!mongoose.Types.ObjectId.isValid(podcastId)) {
      return { valid: false, error: "Invalid podcast ID format" };
    }

    const podcast = await Podcast.findById(podcastId);
    if (!podcast) return { valid: false, error: "Podcast not found" };
    if (pin !== ADMIN_PIN && pin !== podcast.pin) {
      return { valid: false, error: "Invalid PIN for this podcast" };
    }
  }

  return { valid: true };
};

app.get("/podcasts", async (req, res) => {
  try {
    if (req.query.q || req.query.search) {
      const searchTerm = (req.query.q || req.query.search).toLowerCase();
      const results = await Podcast.find({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { host: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("-pin -__v");
      return res.json(results);
    }

    const podcasts = await Podcast.find().select("-pin -__v");
    res.json(podcasts);
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    res.status(500).json({
      error: "Internal server error",
      details: NODE_ENV === "production" ? undefined : error.message,
    });
  }
});
app.get("/podcasts/:id", async (req, res) => {
  try {
    console.log("Fetching podcast with _id:", req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const podcast = await Podcast.findById(req.params.id).select("-pin -__v");

    if (!podcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }

    res.json(podcast);
  } catch (error) {
    console.error("Error fetching podcast:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

app.post("/podcasts", async (req, res) => {
  try {
    console.log("Incoming data:", req.body);

    const { title, host, url, category, pin } = req.body;
    if (!title || !host || !url || !category || !pin) {
      return res.status(400).json({
        error: "All fields are required",
        received: Object.keys(req.body),
      });
    }

    const podcast = new Podcast({
      ...req.body,
      createdAt: new Date(),
    });

    await podcast.save();

    res.status(201).json(podcast);
  } catch (error) {
    console.error("Creation failed:", error);
    res.status(400).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.patch("/podcasts/:id", async (req, res) => {
  try {
    const { pin, ...updateData } = req.body;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const pinValidation = await validatePin(pin, id);
    if (!pinValidation.valid) {
      return res
        .status(
          pinValidation.error === "Invalid PIN for this podcast" ? 403 : 400
        )
        .json(pinValidation);
    }

    if (updateData.url) {
      const urlValidation = validateUrl(updateData.url);
      if (!urlValidation.valid) {
        return res.status(400).json(urlValidation);
      }
    }

    const updateFields = Object.keys(updateData);
    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "No fields to update",
        details: "Provide at least one field to update besides PIN",
      });
    }

    if (updateData.rating !== undefined) {
      updateData.rating = Number(updateData.rating);
    }

    const updatedPodcast = await Podcast.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPodcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }

    const response = updatedPodcast.toObject();
    response.id = response._id.toString();
    delete response._id;
    delete response.__v;
    delete response.pin;

    res.status(200).json(response);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      error: "Failed to update podcast",
      details:
        process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

app.put("/podcasts/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    if (req.body.url) {
      const urlValidation = validateUrl(req.body.url);
      if (!urlValidation.valid) {
        return res.status(400).json(urlValidation);
      }
    }

    const requiredFields = ["title", "host", "url", "category", "pin"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        details: `Please provide: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    const pinValidation = await validatePin(req.body.pin, id);
    if (!pinValidation.valid) {
      return res
        .status(
          pinValidation.error === "Invalid PIN for this podcast" ? 403 : 400
        )
        .json(pinValidation);
    }

    const { pin, ...updateData } = req.body;

    if (updateData.rating !== undefined) {
      updateData.rating = Number(updateData.rating);
    }

    const updatedPodcast = await Podcast.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPodcast) {
      return res.status(404).json({ error: "Podcast not found" });
    }

    const response = updatedPodcast.toObject();
    response.id = response._id.toString();
    delete response._id;
    delete response.__v;
    delete response.pin;

    res.json(response);
  } catch (error) {
    console.error("PUT error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

app.delete("/podcasts/:id", async (req, res) => {
  try {
    const { pin } = req.body;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const validation = await validatePin(pin, id);
    if (!validation.valid) {
      return res
        .status(validation.error === "Invalid PIN for this podcast" ? 403 : 400)
        .json(validation);
    }

    const podcast = await Podcast.findOneAndDelete({ _id: id });
    if (!podcast) {
      console.log(`Podcast with id ${id} not found`);
      return res.status(404).json({ error: "Podcast not found" });
    }

    console.log(`Successfully deleted podcast: ${podcast.title} (ID: ${id})`);

    res.status(200).json({
      message: "Podcast deleted successfully",
      id,
      deletedPodcast: {
        title: podcast.title,
        host: podcast.host,
      },
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      error: "Failed to delete podcast",
      details: NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

const rateLimit = {};
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 0, startTime: now };
  }

  if (now - rateLimit[ip].startTime > RATE_LIMIT_WINDOW) {
    rateLimit[ip] = { count: 0, startTime: now };
  }

  if (rateLimit[ip].count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Too many requests",
      details: `Please try again after ${RATE_LIMIT_WINDOW / 60000} minutes`,
    });
  }

  rateLimit[ip].count++;
  next();
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: NODE_ENV === "production" ? undefined : err.message,
  });
});

module.exports = app;

if (NODE_ENV !== "production") {
  mongoose.connection.once("open", () => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(
        `Allowed podcast domains: ${ALLOWED_PODCAST_DOMAINS.join(", ")}`
      );
    });
  });
}
 */

const app = require("./app");
const mongoose = require("mongoose");
const logger = require("./utils/logger.js");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    logger.success("✅ Connected to MongoDB");
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}...`);
    });

    process.on("unhandledRejection", (err) => {
      logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
      logger.error(`${err.name}: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    logger.error("❌ MongoDB connection error:");
    logger.error(err.message);
    process.exit(1);
  });

if (!process.env.MONGODB_URL) {
  logger.warn("MONGODB_URI not found. Using mock data mode.");
  process.env.USE_MOCK_DATA = "true";
}
