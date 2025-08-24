const express = require("express");
const podcastController = require("../controllers/podcastController.js");
const {
  validatePodcast,
  validatePin,
  validatePodcastId,
} = require("../middleware/validation.js");

const router = express.Router();

router
  .route("/")
  .get(podcastController.getAllPodcasts)
  .post(validatePodcast, podcastController.createPodcast);

router
  .route("/:id")
  .get(validatePodcastId, podcastController.getPodcast)
  .patch(validatePodcastId, validatePin, podcastController.updatePodcast)
  .delete(validatePodcastId, validatePin, podcastController.deletePodcast);
module.exports = router;
