require("dotenv").config({ quiet: true });
const app = require("./app");
const connectDB = require("./config/db");
const seedSkills = require("./utils/seedSkills");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedSkills();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
