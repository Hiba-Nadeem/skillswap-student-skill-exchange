const express = require("express");
const { createReview, getMyReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/me", protect, getMyReviews);

module.exports = router;
