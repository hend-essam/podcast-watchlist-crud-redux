const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const Podcast = require("../models/podcast");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { ALLOWED_PODCAST_DOMAINS, CATEGORIES } = require("../constants");

const validateUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace("www.", "");

    const isAllowed = ALLOWED_PODCAST_DOMAINS.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      throw new Error(
        `Unsupported podcast platform. Allowed domains: ${ALLOWED_PODCAST_DOMAINS.join(
          ", "
        )}`
      );
    }

    return true;
  } catch {
    throw new Error(
      "Invalid URL format. Please provide a valid HTTP/HTTPS URL"
    );
  }
};

exports.validatePodcast = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters")
    .trim(),

  body("host")
    .notEmpty()
    .withMessage("Host is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Host must be between 1 and 50 characters")
    .trim(),

  body("url")
    .notEmpty()
    .withMessage("URL is required")
    .isURL()
    .withMessage("Must be a valid URL")
    .custom(validateUrl)
    .withMessage("Invalid podcast URL"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters")
    .trim(),

  body("rating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),

  body("pin")
    .notEmpty()
    .withMessage("PIN is required")
    .isLength({ min: 4, max: 4 })
    .withMessage("PIN must be exactly 4 digits")
    .isNumeric()
    .withMessage("PIN must contain only numbers"),
  // Check for validation errors
  catchAsync(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return next(
        new AppError(`Validation failed: ${errorMessages.join(", ")}`, 400)
      );
    }

    next();
  }),
];

// PIN validation middleware
exports.validatePin = catchAsync(async (req, res, next) => {
  const { pin } = req.body;
  const podcastId = req.params.id;

  // Check if PIN is provided
  if (!pin) {
    return next(new AppError("PIN is required", 400));
  }

  // Validate PIN format
  if (typeof pin !== "string") {
    return next(new AppError("PIN must be a string", 400));
  }

  if (!/^\d+$/.test(pin)) {
    return next(new AppError("PIN must contain only numbers", 400));
  }

  if (pin.length !== 4) {
    return next(new AppError("PIN must be exactly 4 digits", 400));
  }

  // Validate podcast ID format
  if (!podcastId || !mongoose.Types.ObjectId.isValid(podcastId)) {
    return next(new AppError("Invalid podcast ID format", 400));
  }

  // Find the podcast
  const podcast = await Podcast.findById(podcastId).select("+pin");

  if (!podcast) {
    return next(new AppError("Podcast not found", 404));
  }

  // Check if PIN matches (using the instance method from the model)
  const isPinValid = await podcast.correctPin(pin, podcast.pin);

  if (!isPinValid && pin !== process.env.ADMIN_PIN) {
    return next(new AppError("Invalid PIN for this podcast", 403));
  }

  // Attach podcast to request for use in controllers
  req.podcast = podcast;
  next();
});

// Optional: Middleware to validate podcast ID format
exports.validatePodcastId = catchAsync(async (req, res, next) => {
  const podcastId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(podcastId)) {
    return next(new AppError("Invalid podcast ID format", 400));
  }

  next();
});

// Optional: Middleware to check if user is admin (using ADMIN_PIN)
exports.isAdmin = catchAsync(async (req, res, next) => {
  const { pin } = req.body;

  if (pin !== process.env.ADMIN_PIN) {
    return next(new AppError("Admin access required", 403));
  }

  next();
});
