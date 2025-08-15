require("dotenv").config();
const {
  create,
  router: _router,
  defaults,
  bodyParser,
} = require("json-server");
const server = create();
const middlewares = defaults();

const path = require("path");
const router = _router(path.join(__dirname, "db.json"));

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

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);

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

server.use(middlewares);
server.use(bodyParser);

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

const validatePin = (pin, podcastId = null) => {
  if (!pin) return { valid: false, error: "PIN is required" };
  if (typeof pin !== "string")
    return { valid: false, error: "PIN must be a numbers" };
  if (!/^\d+$/.test(pin))
    return { valid: false, error: "PIN must contain only numbers" };
  if (pin.length < 4)
    return { valid: false, error: "PIN must be at least 4 digits" };

  if (podcastId) {
    const db = router.db.getState();
    const podcast = db.podcasts.find((p) => p.id === podcastId);

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
      const db = router.db.getState();
      const results = db.podcasts.filter((podcast) => {
        return (
          podcast.title?.toString().toLowerCase().includes(searchTerm) ||
          podcast.host?.toString().toLowerCase().includes(searchTerm) ||
          podcast.description?.toString().toLowerCase().includes(searchTerm)
        );
      });
      return res.json(results);
    }

    if (req.method === "DELETE") {
      const { pin } = req.body;
      const id = req.url.split("/").pop();
      const validation = validatePin(pin, id);

      if (!validation.valid) {
        return res
          .status(
            validation.error === "Invalid PIN for this podcast" ? 403 : 400
          )
          .json(validation);
      }

      try {
        const db = router.db.getState();
        const podcastIndex = db.podcasts.findIndex((p) => p.id === id);

        if (podcastIndex === -1) {
          console.log(`Podcast with id ${id} not found`);
          return res.status(404).json({ error: "Podcast not found" });
        }

        const deletedPodcast = db.podcasts[podcastIndex];
        db.podcasts.splice(podcastIndex, 1);
        router.db.setState(db);

        console.log(
          `Successfully deleted podcast: ${deletedPodcast.title} (ID: ${id})`
        );

        return res.status(200).json({
          message: "Podcast deleted successfully",
          id,
          deletedPodcast: {
            title: deletedPodcast.title,
            host: deletedPodcast.host,
          },
        });
      } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({
          error: "Failed to delete podcast",
          details: NODE_ENV === "production" ? undefined : error.message,
        });
      }
    }

    if (req.method === "PATCH") {
      const { pin, ...updateData } = req.body;
      const id = req.url.split("/").pop();

      const pinValidation = validatePin(pin, id);
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
        const rating = Number(updateData.rating);
        updateData.rating = rating;
      }

      try {
        const db = router.db.getState();
        const podcastIndex = db.podcasts.findIndex((p) => p.id === id);

        if (podcastIndex === -1) {
          console.log(`Podcast with id ${id} not found for update`);
          return res.status(404).json({ error: "Podcast not found" });
        }

        const updatedPodcast = {
          ...db.podcasts[podcastIndex],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        db.podcasts[podcastIndex] = updatedPodcast;
        router.db.setState(db);

        console.log(
          `Successfully updated podcast: ${updatedPodcast.title} (ID: ${id})`
        );

        const { pin, ...responseData } = updatedPodcast;
        return res.status(200).json(responseData);
      } catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({
          error: "Failed to update podcast",
          details: NODE_ENV === "production" ? undefined : error.message,
        });
      }
    }

    if (req.method === "POST") {
      const { pin, ...podcastData } = req.body;

      if (podcastData.url) {
        const urlValidation = validateUrl(podcastData.url);
        if (!urlValidation.valid) {
          return res.status(400).json(urlValidation);
        }
      }

      const requiredFields = ["title", "host", "url", "category"];
      const missingFields = requiredFields.filter(
        (field) => !podcastData[field]
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "Missing required fields",
          details: `Please provide: ${missingFields.join(", ")}, pin`,
          missingFields,
        });
      }

      const pinValidation = validatePin(pin);
      if (!pinValidation.valid) {
        return res
          .status(
            pinValidation.error === "Invalid PIN for this podcast" ? 403 : 400
          )
          .json(pinValidation);
      }

      if (podcastData.rating !== undefined) {
        const rating = Number(podcastData.rating);
        podcastData.rating = rating;
      }

      try {
        const db = router.db.getState();
        const newId = Date.now().toString();
        const newPodcast = {
          id: newId,
          ...podcastData,
          pin: pin === ADMIN_PIN ? undefined : pin,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        db.podcasts.push(newPodcast);
        router.db.setState(db);

        console.log(
          `Successfully created podcast: ${newPodcast.title} (ID: ${newId})`
        );

        const { pin: _, ...responseData } = newPodcast;
        return res.status(201).json(responseData);
      } catch (error) {
        console.error("Create error:", error);
        return res.status(500).json({
          error: "Failed to create podcast",
          details: NODE_ENV === "production" ? undefined : error.message,
        });
      }
    }

    if (req.method === "PUT") {
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

      const pinValidation = validatePin(req.body.pin);
      if (!pinValidation.valid) {
        return res
          .status(
            pinValidation.error === "Invalid PIN for this podcast" ? 403 : 400
          )
          .json(pinValidation);
      }

      if (req.body.pin === ADMIN_PIN) {
        delete req.body.pin;
      }
    }

    if (req.method === "PUT" && req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
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

const rateLimit = {};
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

server.use((req, res, next) => {
  const oldRender = router.render;
  router.render = (req, res) => {
    const originalResponse = res.locals.data;

    if (req.method === "GET") {
      if (Array.isArray(originalResponse)) {
        res.locals.data = originalResponse.map((item) => {
          if (item && typeof item === "object") {
            const { pin, ...rest } = item;
            return rest;
          }
          return item;
        });
      } else if (originalResponse && typeof originalResponse === "object") {
        const { pin, ...rest } = originalResponse;
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

// Export for Vercel deployment
module.exports = server;

// Start server locally if not in production
if (NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`JSON Server is running on http://localhost:${PORT}`);
    console.log(
      `Allowed podcast domains: ${ALLOWED_PODCAST_DOMAINS.join(", ")}`
    );
  });
}
