const mongoose = require("mongoose");
const Message = require("../models/Message");
const Request = require("../models/Request");
const User = require("../models/User");

// Two students may message each other only if they have an
// accepted or completed request between them.
const areConnected = async (a, b) => {
  const request = await Request.findOne({
    status: { $in: ["accepted", "completed"] },
    $or: [
      { sender: a, receiver: b },
      { sender: b, receiver: a },
    ],
  });
  return Boolean(request);
};

// GET /api/messages/conversations
// Lists everyone the student is connected with, plus the last message (if any).
const getConversations = async (req, res) => {
  try {
    const me = String(req.user._id);

    const requests = await Request.find({
      status: { $in: ["accepted", "completed"] },
      $or: [{ sender: me }, { receiver: me }],
    });

    const contactIds = [
      ...new Set(
        requests.map((r) => (String(r.sender) === me ? String(r.receiver) : String(r.sender)))
      ),
    ];

    const contacts = await User.find({ _id: { $in: contactIds } }).select("name university");

    const conversations = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: me, receiver: contact._id },
            { sender: contact._id, receiver: me },
          ],
        }).sort({ createdAt: -1 });
        return { user: contact, lastMessage };
      })
    );

    // Most recent conversations first; contacts without messages go last
    conversations.sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tb - ta;
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/messages/:userId
// Full message history with one student, oldest first.
const getThread = async (req, res) => {
  try {
    const me = req.user._id;
    const other = req.params.userId;

    if (!mongoose.isValidObjectId(other)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const otherUser = await User.findById(other).select("name university");
    if (!otherUser) {
      return res.status(404).json({ message: "Student not found" });
    }

    const connected = await areConnected(me, other);

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me },
      ],
    }).sort({ createdAt: 1 });

    res.json({ user: otherUser, connected, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/messages/:userId   Body: { text }
const sendMessage = async (req, res) => {
  try {
    const me = req.user._id;
    const other = req.params.userId;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(other)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (!(await areConnected(me, other))) {
      return res
        .status(403)
        .json({ message: "You can message a student after a request between you is accepted" });
    }

    const message = await Message.create({ sender: me, receiver: other, text });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversations, getThread, sendMessage };
