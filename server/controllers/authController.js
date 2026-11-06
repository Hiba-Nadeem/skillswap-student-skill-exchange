const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Creates a signed JWT containing the user's id, valid for 7 days
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Loads a user with skill names filled in (instead of bare ids)
const findUserWithSkills = (id) =>
  User.findById(id).populate("skillsToTeach skillsToLearn", "name category");

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, university, department } = req.body;

    if (!name || !email || !password || !university) {
      return res.status(400).json({ message: "Name, email, password and university are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Hash the password with bcrypt (10 salt rounds) before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      university,
      department,
    });

    const fullUser = await findUserWithSkills(user._id);
    res.status(201).json({ token: generateToken(user._id), user: fullUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Explicitly include the password field (it is hidden by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const fullUser = await findUserWithSkills(user._id);
    res.json({ token: generateToken(user._id), user: fullUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  try {
    const user = await findUserWithSkills(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };
