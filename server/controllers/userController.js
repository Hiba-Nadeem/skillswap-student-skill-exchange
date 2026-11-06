const mongoose = require("mongoose");
const User = require("../models/User");
const Skill = require("../models/Skill");

const SKILL_FIELDS = "name category";

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

module.exports = { updateProfile };
