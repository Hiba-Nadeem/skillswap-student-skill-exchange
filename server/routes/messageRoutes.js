const express = require("express");
const { getConversations, getThread, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/conversations", protect, getConversations); // must come before "/:userId"
router.get("/:userId", protect, getThread);
router.post("/:userId", protect, sendMessage);

module.exports = router;
