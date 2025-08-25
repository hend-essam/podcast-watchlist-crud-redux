const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const podcastRoutes = require("./routes/podcastRoutes.js");
const AppError = require("./utils/AppError.js");
const globalErrorHandler = require("./controllers/errorController.js");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp({ whitelist: ["category", "rating"] }));
app.use(express.json({ limit: "10kb" }));
app.use(cors());
app.options("*", cors());

app.use((req, res, next) => {
  req.setTimeout(10000, () => {
    if (!res.headersSent) {
      res.status(504).json({ error: "Request timeout" });
    }
  });

  res.setTimeout(10000, () => {
    if (!res.headersSent) {
      res.status(504).json({ error: "Response timeout" });
    }
  });

  next();
});

const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again in 15 minutes.",
});

app.use("/api", limiter);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Podcast Watchlist API!",
    version: "1.0.0",
    documentation: "Visit /api/v1/podcasts for API endpoints",
    endpoints: {
      getAllPodcasts: "GET /api/v1/podcasts",
      createPodcast: "POST /api/v1/podcasts",
      getPodcast: "GET /api/v1/podcasts/:id",
      updatePodcast: "PATCH /api/v1/podcasts/:id",
      deletePodcast: "DELETE /api/v1/podcasts/:id",
    },
  });
});

app.use("/api/v1/podcasts", podcastRoutes);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
