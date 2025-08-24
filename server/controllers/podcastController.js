const Podcast = require("../models/podcast.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/AppError.js");
const APIFeatures = require("../utils/apiFeatures.js");

exports.getAllPodcasts = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter = {
      $or: [
        { title: searchRegex },
        { host: searchRegex },
        { description: searchRegex },
      ],
    };
    delete req.query.search;
  }

  const features = new APIFeatures(Podcast.find(filter), req.query)
    .filter()
    .sort()
    .limitFields();

  const podcasts = await features.query;

  res.status(200).json({
    status: "success",
    results: podcasts.length,
    data: { podcasts },
  });
});

exports.getPodcast = catchAsync(async (req, res, next) => {
  const podcast = await Podcast.findById(req.params.id);

  if (!podcast) {
    return next(new AppError("No podcast found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { podcast },
  });
});

exports.createPodcast = catchAsync(async (req, res, next) => {
  const newPodcast = await Podcast.create(req.body);
  const podcastResponse = newPodcast.toObject();
  delete podcastResponse.updatedAt;

  res.status(201).json({
    status: "success",
    data: { podcast: podcastResponse },
  });
});

exports.updatePodcast = catchAsync(async (req, res, next) => {
  const { pin, ...updateData } = req.body;
  const id = req.params.id;

  const podcast = await Podcast.findById(id);

  if (!podcast) {
    return next(new AppError("No podcast found with that ID", 404));
  }

  Object.keys(updateData).forEach((key) => {
    podcast[key] = updateData[key];
  });

  const updatedPodcast = await podcast.save();

  res.status(200).json({
    status: "success",
    data: { podcast: updatedPodcast },
  });
});

exports.deletePodcast = catchAsync(async (req, res, next) => {
  const { pin } = req.body;
  const id = req.params.id;

  const podcast = await Podcast.findById(id).select("+pin");

  if (!podcast) {
    return next(new AppError("No podcast found with that ID", 404));
  }

  const isPinValid = await podcast.correctPin(pin);
  const isAdminPin = pin === process.env.ADMIN_PIN;

  if (!isPinValid && !isAdminPin) {
    return next(new AppError("Invalid PIN for this podcast", 403));
  }

  await Podcast.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getPodcastStats = catchAsync(async (req, res, next) => {
  const stats = await Podcast.aggregate([
    {
      $group: {
        _id: "$category",
        numPodcasts: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        minRating: { $min: "$rating" },
        maxRating: { $max: "$rating" },
      },
    },
    {
      $sort: { avgRating: -1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

exports.getTopRated = catchAsync(async (req, res, next) => {
  const podcasts = await Podcast.find().sort("-rating").limit(5);

  res.status(200).json({
    status: "success",
    results: podcasts.length,
    data: { podcasts },
  });
});
