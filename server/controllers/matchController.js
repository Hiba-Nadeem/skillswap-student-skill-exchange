const User = require("../models/User");

// GET /api/matches
// Mutual matching: for the logged-in student A and every other student B,
//   theyCanTeachMe = TeachB ∩ LearnA
//   iCanTeachThem  = TeachA ∩ LearnB
//   score M(A,B)   = |theyCanTeachMe| + |iCanTeachThem|
// A match is only "mutual" when BOTH sets are non-empty.
// Results are ranked by score, highest first.
const getMatches = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).populate(
      "skillsToTeach skillsToLearn",
      "name category"
    );

    const myTeach = new Set(me.skillsToTeach.map((s) => String(s._id)));
    const myLearn = new Set(me.skillsToLearn.map((s) => String(s._id)));

    // Nothing to match on yet
    if (myTeach.size === 0 || myLearn.size === 0) {
      return res.json({ matches: [], needsSkills: true });
    }

    const others = await User.find({ _id: { $ne: me._id } }).populate(
      "skillsToTeach skillsToLearn",
      "name category"
    );

    const matches = others
      .map((other) => {
        const theyCanTeachMe = other.skillsToTeach.filter((s) => myLearn.has(String(s._id)));
        const iCanTeachThem = other.skillsToLearn.filter((s) => myTeach.has(String(s._id)));
        return {
          user: other,
          theyCanTeachMe,
          iCanTeachThem,
          score: theyCanTeachMe.length + iCanTeachThem.length,
        };
      })
      .filter((m) => m.theyCanTeachMe.length > 0 && m.iCanTeachThem.length > 0)
      .sort((a, b) => b.score - a.score);

    res.json({ matches, needsSkills: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMatches };
