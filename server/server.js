const {
  create,
  router: _router,
  defaults,
  bodyParser,
} = require("json-server");
const server = create();
const router = _router("db.json");
const middlewares = defaults();

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  console.log(`${req.method} ${req.url}`);
  next();
});

server.use(middlewares);
server.use(bodyParser);

const ADMIN_PIN = "1234";

server.use((req, res, next) => {
  try {
    const validatePin = (pin, podcastId = null) => {
      if (!pin) {
        return { valid: false, error: "PIN is required" };
      }

      if (typeof pin !== "string") {
        return { valid: false, error: "PIN must be a string" };
      }

      if (podcastId) {
        const db = router.db.getState();
        const podcast = db.podcasts.find((p) => p.id === podcastId);

        if (!podcast) {
          return { valid: false, error: "Podcast not found" };
        }

        if (pin !== ADMIN_PIN && pin !== podcast.pin) {
          return { valid: false, error: "Invalid PIN for this podcast" };
        }
      }

      return { valid: true };
    };

    if (req.method === "DELETE") {
      const { pin } = req.body;
      const id = req.url.split("/").pop();
      const validation = validatePin(pin, id);

      if (!validation.valid) {
        return res
          .status(
            validation.error === "Invalid PIN for this podcast" ? 403 : 400
          )
          .json({
            error: validation.error,
            details:
              validation.error === "Podcast not found"
                ? `No podcast found with ID ${id}`
                : "Please provide a valid PIN in the request body",
          });
      }
      return next();
    }

    if (["POST", "PUT"].includes(req.method)) {
      const { title, host, url, category, pin } = req.body;

      if (!title || !host || !url || !category || !pin) {
        return res.status(400).json({
          error: "Missing required fields",
          details: "Title, host, URL, category, and PIN are required",
        });
      }

      const validation = validatePin(
        pin,
        req.method === "PUT" ? req.url.split("/").pop() : null
      );
      if (!validation.valid) {
        return res
          .status(
            validation.error === "Invalid PIN for this podcast" ? 403 : 400
          )
          .json({
            error: validation.error,
            details: "Please provide a valid PIN in the request body",
          });
      }
    }

    if (req.method === "PATCH") {
      const { pin } = req.body;
      const id = req.url.split("/").pop();

      if (!pin) {
        return res.status(400).json({
          error: "PIN is required",
          details: "Please provide a PIN in the request body",
        });
      }

      const validation = validatePin(pin, id);
      if (!validation.valid) {
        return res
          .status(
            validation.error === "Invalid PIN for this podcast" ? 403 : 400
          )
          .json({
            error: validation.error,
            details:
              validation.error === "Podcast not found"
                ? `No podcast found with ID ${id}`
                : "The provided PIN doesn't match admin or podcast PIN",
          });
      }

      if (pin === ADMIN_PIN) {
        delete req.body.pin;
      }

      const updateFields = Object.keys(req.body).filter((key) => key !== "pin");
      if (updateFields.length === 0) {
        return res.status(400).json({
          error: "No fields to update",
          details: "Provide at least one field to update besides PIN",
        });
      }
    }

    if (
      req.body.rating &&
      (isNaN(req.body.rating) || req.body.rating < 0 || req.body.rating > 5)
    ) {
      return res.status(400).json({
        error: "Invalid rating",
        details: "Rating must be a number between 0 and 5",
      });
    }

    if (req.body.url && !/^https?:\/\/.+\..+/.test(req.body.url)) {
      return res.status(400).json({
        error: "Invalid URL",
        details: "Please provide a valid HTTP/HTTPS URL",
      });
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: "An error occurred during request validation",
    });
  }
});

const rateLimit = {};
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

server.use((req, res, next) => {
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

server.use(router);

server.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log(`Admin PIN: ${ADMIN_PIN}`);
});
