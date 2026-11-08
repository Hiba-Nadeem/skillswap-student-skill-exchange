const mongoose = require("mongoose");

// A collaboration request between two students.
// Lifecycle: pending -> accepted -> completed, or pending -> rejected
const requestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Skill the sender wants to learn from the receiver
    skillWanted: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    // Skill the sender offers to teach the receiver in return
    skillOffered: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    message: { type: String, default: "", maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
