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

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://podcast-watchlist-crud-redux-fronte.vercel.app",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Blocked CORS request from origin: ${origin}`); // Log for debugging
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

app.use(cors(corsOptions));
app.options("/api/v1/podcasts", cors(corsOptions));

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp({ whitelist: ["category", "rating"] }));
app.use(express.json({ limit: "10kb" }));

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
  });
});

app.use("/api/v1/podcasts", podcastRoutes);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
