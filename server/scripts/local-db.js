// Development only: a real MongoDB process with data kept between restarts.
const { mkdir } = require("node:fs/promises");
const path = require("node:path");
const { MongoMemoryServer } = require("mongodb-memory-server");

async function start() {
  const dbPath = path.join(__dirname, "..", ".local-data");
  await mkdir(dbPath, { recursive: true });
  const database = await MongoMemoryServer.create({
    instance: { port: 27017, ip: "127.0.0.1", dbPath, storageEngine: "wiredTiger" },
  });
  console.log("Local MongoDB ready at mongodb://127.0.0.1:27017/skillswap");
  console.log("Data is stored in server/.local-data. Keep this terminal running.");
  let stopping = false;
  async function stop() {
    if (stopping) return;
    stopping = true;
    await database.stop({ doCleanup: false });
    process.exit(0);
  }
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

start().catch((error) => { console.error(error.message); process.exitCode = 1; });
