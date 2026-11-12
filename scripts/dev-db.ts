/**
 * Campus Hive - Persistent Local MongoDB Development Server
 *
 * Runs a standalone, persistent MongoDB instance on localhost:27017 using mongodb-memory-server
 * backed by the local disk directory (.mongo-dev-data).
 *
 * This allows full offline Next.js development without requiring a separate MongoDB installation
 * or Docker, and guarantees that seed scripts (npm run seed:100) and app actions persist across restarts.
 */

import fs from "fs";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

async function main() {
  const dataDir = path.resolve(process.cwd(), ".mongo-dev-data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const port = 27017;
  const dbName = "campushive";

  console.log("\n========================================================");
  console.log("🍃 Starting Campus Hive Persistent Local MongoDB Server...");
  console.log(`📁 Storage directory: ${dataDir}`);
  console.log(`🔌 Target port: ${port}`);
  console.log("========================================================\n");

  let mongod: MongoMemoryServer;

  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        port,
        dbName,
        dbPath: dataDir,
        storageEngine: "wiredTiger",
      },
    });
  } catch (err: any) {
    if (err?.message?.includes("EADDRINUSE") || err?.message?.includes("already in use")) {
      console.log(`ℹ️  Port ${port} is already in use by another MongoDB process.`);
      console.log(`Your application and seed scripts can connect to mongodb://127.0.0.1:${port}/${dbName} directly!`);
      process.exit(0);
    }
    console.error("❌ Failed to start local MongoDB:", err);
    process.exit(1);
  }

  const uri = mongod.getUri();
  console.log("✅ Local MongoDB server is up and running!");
  console.log(`📍 Connection URI: ${uri}${dbName}`);
  console.log(`💾 Data is persistently saved in: .mongo-dev-data`);
  console.log("\nYou can now run in another terminal:");
  console.log("  npm run seed:100       (seeds 100 users, 36 stores, 100 listings)");
  console.log("  npm run dev            (starts Next.js app on http://localhost:3000)");
  console.log("\nPress Ctrl+C to safely stop the database server.\n");

  const cleanup = async () => {
    console.log("\n🛑 Stopping MongoDB server...");
    try {
      await mongod.stop();
      console.log("👋 MongoDB server safely shut down.");
    } catch (stopErr) {
      console.error("Error shutting down MongoDB:", stopErr);
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Keep process running indefinitely
  await new Promise(() => {});
}

main().catch((err) => {
  console.error("Fatal MongoDB daemon error:", err);
  process.exit(1);
});
