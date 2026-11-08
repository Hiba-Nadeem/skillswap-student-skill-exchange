const express = require("express");
const { searchUsers, getUserById, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, searchUsers);
router.put("/profile", protect, updateProfile); // must come before "/:id"
router.get("/:id", protect, getUserById);

module.exports = router;
