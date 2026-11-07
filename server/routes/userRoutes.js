const express = require("express");
const { searchUsers, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, searchUsers);
router.put("/profile", protect, updateProfile);

module.exports = router;
