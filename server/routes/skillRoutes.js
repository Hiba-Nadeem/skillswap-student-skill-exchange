const express = require("express");
const { getSkills } = require("../controllers/skillController");

const router = express.Router();

router.get("/", getSkills); // public: used on the landing and signup pages

module.exports = router;
