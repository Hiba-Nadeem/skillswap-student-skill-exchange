const mongoose = require("mongoose");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Review = require("../models/Review");

const SKILL_FIELDS = "name category";

// GET /api/users?skill=<skillId>&q=<text>
// Search students by a skill they can teach and/or by name/university text.
const searchUsers = async (req, res) => {
  try {
    const { skill, q } = req.query;
    const filter = { _id: { $ne: req.user._id } }; // never include yourself

    if (skill) {
      if (!mongoose.isValidObjectId(skill)) {
        return res.status(400).json({ message: "Invalid skill id" });
      }
      filter.skillsToTeach = skill;
    }

    if (q && q.trim()) {
      // Escape regex special characters so user input is treated as plain text
      const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");
      filter.$or = [{ name: regex }, { university: regex }, { department: regex }];
    }

    const users = await User.find(filter)
      .populate("skillsToTeach skillsToLearn", SKILL_FIELDS)
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/:id
// Public profile of one student, including rating summary.
const getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(req.params.id).populate(
      "skillsToTeach skillsToLearn",
      SKILL_FIELDS
    );
    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "name university")
      .sort({ createdAt: -1 });

    const average =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      user,
      reviews,
      rating: { average: Number(average.toFixed(1)), count: reviews.length },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/profile
// Update the logged-in student's profile and skills.
const updateProfile = async (req, res) => {
  try {
    const { name, university, department, bio, skillsToTeach, skillsToLearn } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Name cannot be empty" });
      updates.name = name;
    }
    if (university !== undefined) {
      if (!university.trim()) return res.status(400).json({ message: "University cannot be empty" });
      updates.university = university;
    }
    if (department !== undefined) updates.department = department;
    if (bio !== undefined) updates.bio = bio;

    // Validate that every skill id exists in the shared Skills collection
    for (const [field, ids] of [
      ["skillsToTeach", skillsToTeach],
      ["skillsToLearn", skillsToLearn],
    ]) {
      if (ids === undefined) continue;
      if (!Array.isArray(ids) || !ids.every((id) => mongoose.isValidObjectId(id))) {
        return res.status(400).json({ message: `${field} must be a list of skill ids` });
      }
      const unique = [...new Set(ids.map(String))];
      const found = await Skill.countDocuments({ _id: { $in: unique } });
      if (found !== unique.length) {
        return res.status(400).json({ message: `${field} contains an unknown skill` });
      }
      updates[field] = unique;
    }

    await User.updateOne({ _id: req.user._id }, updates, { runValidators: true });

    // Return the updated profile with skill names filled in
    const user = await User.findById(req.user._id).populate(
      "skillsToTeach skillsToLearn",
      SKILL_FIELDS
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchUsers, getUserById, updateProfile };
