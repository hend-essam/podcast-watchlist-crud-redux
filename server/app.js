const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const podcastRoutes = require("./routes/podcastRoutes.js");
const AppError = require("./utils/AppError.js");

require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "https://podcast-watchlist-crud-redux-frontend-kakn0wogg.vercel.app" ||
    "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("CORS: Request Origin:", origin);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("CORS: Blocked origin:", origin);
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
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(mongoSanitize());
app.use(hpp({ whitelist: ["category", "rating"] }));
app.use(express.json({ limit: "10kb" }));

app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
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

app.use((err, req, res, next) => {
  const origin = req.get("origin");
  const allowedOrigins = [
    "https://podcast-watchlist-crud-redux-frontend-kakn0wogg.vercel.app" ||
      "http://localhost:5173",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,X-Requested-With,Accept"
    );
  }

  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Something went wrong!",
  });
});

module.exports = app;
