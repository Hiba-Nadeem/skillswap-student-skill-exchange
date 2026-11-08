const mongoose = require("mongoose");

// A rating + written review, tied to a completed request (session).
const reviewSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

// Each student can review a given session only once
reviewSchema.index({ request: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
