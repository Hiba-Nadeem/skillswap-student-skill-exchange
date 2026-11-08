const mongoose = require("mongoose");
const Review = require("../models/Review");
const Request = require("../models/Request");

// POST /api/reviews   Body: { requestId, rating, comment }
// Allowed only for participants of a COMPLETED request, once per participant.
const createReview = async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;
    const me = String(req.user._id);

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: "Invalid request id" });
    }
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Session not found" });
    }

    const isSender = String(request.sender) === me;
    const isReceiver = String(request.receiver) === me;
    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: "You were not part of this session" });
    }
    if (request.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed sessions" });
    }

    const already = await Review.findOne({ request: requestId, reviewer: me });
    if (already) {
      return res.status(400).json({ message: "You have already reviewed this session" });
    }

    const review = await Review.create({
      request: requestId,
      reviewer: me,
      reviewee: isSender ? request.receiver : request.sender,
      rating: numericRating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/me
// Reviews the logged-in student has received, with average rating.
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.user._id })
      .populate("reviewer", "name university")
      .populate({ path: "request", populate: { path: "skillWanted skillOffered", select: "name" } })
      .sort({ createdAt: -1 });

    const average =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.json({ reviews, average: Number(average.toFixed(1)), count: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getMyReviews };
