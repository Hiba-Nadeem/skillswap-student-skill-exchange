const Skill = require("../models/Skill");

// The shared list of skills. Students pick from this list instead of typing
// free text, so "Python", "python" and "Pyhton" never become three different skills.
const DEFAULT_SKILLS = [
  { name: "Python", category: "Programming" },
  { name: "JavaScript", category: "Programming" },
  { name: "Java", category: "Programming" },
  { name: "C++", category: "Programming" },
  { name: "SQL", category: "Programming" },
  { name: "React", category: "Web Development" },
  { name: "Node.js", category: "Web Development" },
  { name: "HTML & CSS", category: "Web Development" },
  { name: "Machine Learning", category: "Data & AI" },
  { name: "Data Analysis", category: "Data & AI" },
  { name: "Statistics", category: "Data & AI" },
  { name: "Excel", category: "Data & AI" },
  { name: "Photoshop", category: "Design" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Figma", category: "Design" },
  { name: "Video Editing", category: "Design" },
  { name: "Calculus", category: "Mathematics" },
  { name: "Linear Algebra", category: "Mathematics" },
  { name: "Public Speaking", category: "Soft Skills" },
  { name: "Technical Writing", category: "Soft Skills" },
  { name: "French", category: "Languages" },
  { name: "Arabic", category: "Languages" },
  { name: "Chinese", category: "Languages" },
  { name: "Guitar", category: "Creative" },
];

// Inserts the default skills only if the collection is empty
const seedSkills = async () => {
  const count = await Skill.countDocuments();
  if (count === 0) {
    await Skill.insertMany(DEFAULT_SKILLS);
    console.log(`Seeded ${DEFAULT_SKILLS.length} skills`);
  }
};

module.exports = seedSkills;
