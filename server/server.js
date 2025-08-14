require("dotenv").config({ silent: true });

const {
  create,
  router: _router,
  defaults,
  bodyParser,
} = require("json-server");
const path = require("path");
const server = create();

const router = _router(path.join(__dirname, "db.json"));
const middlewares = defaults();

const ADMIN_PIN = process.env.ADMIN_PIN;
const NODE_ENV = process.env.NODE_ENV || "development";
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

server.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://podcast-watchlist-crud-redux.vercel.app",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

server.use(middlewares);
server.use(bodyParser);

const validateUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace("www.", "");
    const isAllowed = ALLOWED_PODCAST_DOMAINS.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
    );

    return isAllowed
      ? { valid: true }
      : {
          valid: false,
          error: "Unsupported podcast platform",
          details: `Allowed domains: ${ALLOWED_PODCAST_DOMAINS.join(", ")}`,
        };
  } catch {
    return {
      valid: false,
      error: "Invalid URL format",
      details: "Please provide a valid HTTP/HTTPS URL",
    };
  }
};

const validatePin = (pin, podcastId = null) => {
  if (!pin) return { valid: false, error: "PIN is required" };
  if (typeof pin !== "string")
    return { valid: false, error: "PIN must be a string" };
  if (!/^\d+$/.test(pin))
    return { valid: false, error: "PIN must contain only numbers" };
  if (pin.length < 4)
    return { valid: false, error: "PIN must be at least 4 digits" };

  if (podcastId) {
    const podcast = router.db.get("podcasts").getById(podcastId).value();
    if (!podcast) return { valid: false, error: "Podcast not found" };
    if (pin !== ADMIN_PIN && pin !== podcast.pin) {
      return { valid: false, error: "Invalid PIN for this podcast" };
    }
  }

  return { valid: true };
};

server.use((req, res, next) => {
  try {
    if (req.method === "GET" && (req.query.q || req.query.search)) {
      const searchTerm = (req.query.q || req.query.search).toLowerCase();
      const results = router.db
        .get("podcasts")
        .filter((podcast) =>
          ["title", "host", "description"].some((field) =>
            podcast[field]?.toLowerCase().includes(searchTerm)
          )
        )
        .value();
      return res.json(results);
    }

    if (req.method === "DELETE") {
      const { pin } = req.body;
      const id = req.url.split("/").pop();
      const validation = validatePin(pin, id);

      if (!validation.valid) {
        return res
          .status(validation.error.includes("Invalid") ? 403 : 400)
          .json(validation);
      }
      return next();
    }

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      if (req.body.url) {
        const urlValidation = validateUrl(req.body.url);
        if (!urlValidation.valid) return res.status(400).json(urlValidation);
      }

      if (["POST", "PUT"].includes(req.method)) {
        const requiredFields = ["title", "host", "url", "category", "pin"];
        const missingFields = requiredFields.filter(
          (field) => !req.body[field]
        );

        if (missingFields.length) {
          return res.status(400).json({
            error: "Missing required fields",
            details: `Please provide: ${missingFields.join(", ")}`,
            missingFields,
          });
        }
      }

      const podcastId = ["PUT", "PATCH"].includes(req.method)
        ? req.url.split("/").pop()
        : null;
      const pinValidation = validatePin(req.body.pin, podcastId);
      if (!pinValidation.valid) {
        return res
          .status(pinValidation.error.includes("Invalid") ? 403 : 400)
          .json(pinValidation);
      }

      if (req.body.pin === ADMIN_PIN) delete req.body.pin;
    }

    if (req.method === "PATCH") {
      const updateFields = Object.keys(req.body).filter((key) => key !== "pin");
      if (!updateFields.length) {
        return res.status(400).json({
          error: "No fields to update",
          details: "Provide at least one field to update besides PIN",
        });
      }
    }

    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({
          error: "Invalid rating",
          details: "Rating must be a number between 0 and 5",
        });
      }
      req.body.rating = rating;
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: NODE_ENV === "production" ? undefined : error.message,
    });
  }
});

const rateLimit = new Map();
server.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  rateLimit.forEach((value, key) => {
    if (value.startTime < windowStart) rateLimit.delete(key);
  });

  const record = rateLimit.get(ip) || { count: 0, startTime: now };

  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Too many requests",
      details: `Please try again after ${RATE_LIMIT_WINDOW / 60000} minutes`,
    });
  }

  record.count++;
  rateLimit.set(ip, record);
  next();
});

server.use((req, res, next) => {
  const oldRender = router.render;

  router.render = (req, res) => {
    const data = res.locals.data;

    if (req.method === "GET" && data) {
      if (Array.isArray(data)) {
        res.locals.data = data.map((item) => {
          if (item && typeof item === "object") {
            const { pin, ...rest } = item;
            return rest;
          }
          return item;
        });
      } else if (typeof data === "object") {
        const { pin, ...rest } = data;
        res.locals.data = rest;
      }
    }

    oldRender(req, res);
  };

  next();
});

server.use(router);

server.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: NODE_ENV === "production" ? undefined : err.message,
  });
});

module.exports = server;
