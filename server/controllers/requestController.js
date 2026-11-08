const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");
const Review = require("../models/Review");

const POPULATE = [
  { path: "sender", select: "name university" },
  { path: "receiver", select: "name university" },
  { path: "skillWanted", select: "name" },
  { path: "skillOffered", select: "name" },
];

// POST /api/requests
// Body: { receiverId, skillWanted, skillOffered, message }
const createRequest = async (req, res) => {
  try {
    const { receiverId, skillWanted, skillOffered, message } = req.body;
    const senderId = req.user._id;

    if (![receiverId, skillWanted, skillOffered].every((id) => mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: "Receiver, skill wanted and skill offered are required" });
    }
    if (String(receiverId) === String(senderId)) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Student not found" });
    }

    // The receiver must actually teach the skill you want...
    if (!receiver.skillsToTeach.some((id) => String(id) === String(skillWanted))) {
      return res.status(400).json({ message: "This student does not teach the selected skill" });
    }
    // ...and you must actually teach the skill you offer
    if (!req.user.skillsToTeach.some((id) => String(id) === String(skillOffered))) {
      return res.status(400).json({ message: "You can only offer a skill listed on your profile" });
    }

    // Block duplicates: only one open (pending/accepted) request per pair
    const open = await Request.findOne({
      status: { $in: ["pending", "accepted"] },
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });
    if (open) {
      return res.status(400).json({ message: `You already have a ${open.status} request with this student` });
    }

    const request = await Request.create({
      sender: senderId,
      receiver: receiverId,
      skillWanted,
      skillOffered,
      message,
    });

    res.status(201).json(await request.populate(POPULATE));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests
// Returns { sent, received } for the logged-in student.
// Each request includes "reviewedByMe" so the UI knows whether to show the review form.
const getMyRequests = async (req, res) => {
  try {
    const me = req.user._id;

    const [sent, received, myReviews] = await Promise.all([
      Request.find({ sender: me }).populate(POPULATE).sort({ updatedAt: -1 }),
      Request.find({ receiver: me }).populate(POPULATE).sort({ updatedAt: -1 }),
      Review.find({ reviewer: me }).select("request"),
    ]);

    const reviewed = new Set(myReviews.map((r) => String(r.request)));
    const withFlag = (list) =>
      list.map((r) => ({ ...r.toObject(), reviewedByMe: reviewed.has(String(r._id)) }));

    res.json({ sent: withFlag(sent), received: withFlag(received) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/requests/:id/status   Body: { status }
// Rules:
//   - only the receiver can accept or reject a pending request
//   - either participant can mark an accepted request as completed
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const me = String(req.user._id);

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const isSender = String(request.sender) === me;
    const isReceiver = String(request.receiver) === me;
    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: "This request does not belong to you" });
    }

    if (status === "accepted" || status === "rejected") {
      if (!isReceiver) {
        return res.status(403).json({ message: "Only the receiver can accept or reject" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: `Request is already ${request.status}` });
      }
    } else if (status === "completed") {
      if (request.status !== "accepted") {
        return res.status(400).json({ message: "Only accepted requests can be completed" });
      }
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }

    request.status = status;
    await request.save();

    res.json(await request.populate(POPULATE));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, updateRequestStatus };
