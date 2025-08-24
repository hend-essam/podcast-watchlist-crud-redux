const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { CATEGORIES } = require("../constants");

const podcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A podcast must have a title"],
    trim: true,
    maxlength: [100, "Title must be less than 100 characters"],
  },
  host: {
    type: String,
    required: [true, "A podcast must have a host"],
    trim: true,
  },
  url: {
    type: String,
    required: [true, "A podcast must have a URL"],
    validate: {
      validator: function (url) {
        return true;
      },
      message: "Invalid podcast URL",
    },
  },
  category: {
    type: String,
    required: [true, "A podcast must have a category"],
    enum: {
      values: CATEGORIES,
      message: `Category is either: ${CATEGORIES.join(", ")}`,
    },
  },
  description: {
    type: String,
    maxlength: [500, "Description must be less than 500 characters"],
  },
  rating: {
    type: Number,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: (val) => Math.round(val * 10) / 10,
  },
  pin: {
    type: String,
    required: [true, "A PIN is required"],
    minlength: [4, "PIN must be exactly 4 characters"],
    maxlength: [4, "PIN must be exactly 4 characters"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

podcastSchema.index({ title: "text", host: "text", description: "text" });
podcastSchema.index({ category: 1 });
podcastSchema.index({ rating: -1 });

podcastSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (doc.isNew) {
      delete ret.updatedAt;
    }
    delete ret.pin;
    delete ret.__v;
    return ret;
  },
});

podcastSchema.pre("save", async function (next) {
  if (!this.isModified("pin")) return next();

  try {
    this.pin = await bcrypt.hash(this.pin, 12);
    next();
  } catch (error) {
    next(error);
  }
});

podcastSchema.pre("save", function (next) {
  if (this.isNew) {
    this.createdAt = Date.now();
  } else if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

podcastSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const updateFields = Object.keys(update);
  if (
    updateFields.length === 1 &&
    updateFields[0] === "$set" &&
    Object.keys(update.$set).length === 1 &&
    Object.keys(update.$set)[0] === "updatedAt"
  ) {
    return next();
  }
  this.set({ updatedAt: Date.now(), $setOnInsert: { createdAt: Date.now() } });
  next();
});

podcastSchema.methods.correctPin = async function (candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

podcastSchema.statics.validatePin = async function (podcastId, candidatePin) {
  const podcast = await this.findById(podcastId).select("+pin");
  if (!podcast) throw new Error("Podcast not found");

  const isMatch = await bcrypt.compare(candidatePin, podcast.pin);
  if (!isMatch && candidatePin !== process.env.ADMIN_PIN) {
    throw new Error("Invalid PIN");
  }

  return true;
};

module.exports = mongoose.model("Podcast", podcastSchema);
