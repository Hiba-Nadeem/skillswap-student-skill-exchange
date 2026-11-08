const express = require("express");
const {
  createRequest,
  getMyRequests,
  updateRequestStatus,
} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/", protect, getMyRequests);
router.patch("/:id/status", protect, updateRequestStatus);

module.exports = router;
