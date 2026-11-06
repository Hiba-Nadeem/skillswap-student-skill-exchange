const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false means the password hash is never returned unless we ask for it
    password: { type: String, required: true, minlength: 6, select: false },
    university: { type: String, required: true, trim: true },
    department: { type: String, default: "", trim: true },
    bio: { type: String, default: "", maxlength: 500 },
    // References to documents in the Skills collection
    skillsToTeach: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    skillsToLearn: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
