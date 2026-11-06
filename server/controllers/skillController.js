const Skill = require("../models/Skill");

// GET /api/skills  (public)
// Returns the shared skill list, sorted by category then name.
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSkills };
