/**
 * Sequential deployment gate for deployed databases.
 *
 * The staging check must pass before the production check starts. This script
 * only reads index metadata; it never creates, drops, or rebuilds indexes.
 */

import mongoose from "mongoose";
import { verifyProductionIndexes } from "./verify-production-indexes";

function databaseFromUri(uri: string): string | null {
  const pathname = new URL(uri).pathname.replace(/^\/+/, "");
  return pathname ? decodeURIComponent(pathname) : null;
}

async function verifyTarget(label: string, uri: string, expectedDatabase: string): Promise<void> {
  const uriDatabase = databaseFromUri(uri);
  if (!uriDatabase || uriDatabase !== expectedDatabase) {
    throw new Error(
      `${label} URI must explicitly target database '${expectedDatabase}', found '${uriDatabase || "none"}'.`
    );
  }

  console.log(`\n=== ${label} index verification: database '${expectedDatabase}' ===`);
  await mongoose.connect(uri, { dbName: expectedDatabase, serverSelectionTimeoutMS: 15_000 });
  try {
    const connectedDatabase = mongoose.connection.db?.databaseName;
    if (connectedDatabase !== expectedDatabase) {
      throw new Error(
        `${label} connected to '${connectedDatabase || "unknown"}' instead of '${expectedDatabase}'.`
      );
    }
    await verifyProductionIndexes(mongoose.connection.db || undefined);
  } finally {
    await mongoose.disconnect();
  }
}

async function run() {
  const stagingUri = process.env.STAGING_MONGODB_URI;
  const productionUri = process.env.PRODUCTION_MONGODB_URI;
  const stagingDatabase = process.env.STAGING_MONGODB_DATABASE;
  const productionDatabase = process.env.PRODUCTION_MONGODB_DATABASE;

  if (!stagingUri || !productionUri || !stagingDatabase || !productionDatabase) {
    throw new Error(
      "STAGING_MONGODB_URI, STAGING_MONGODB_DATABASE, PRODUCTION_MONGODB_URI, and PRODUCTION_MONGODB_DATABASE are required."
    );
  }
  if (stagingUri === productionUri || stagingDatabase === productionDatabase) {
    throw new Error("Staging and production targets must be distinct; refusing ambiguous deployment verification.");
  }

  await verifyTarget("STAGING", stagingUri, stagingDatabase);
  await verifyTarget("PRODUCTION", productionUri, productionDatabase);
  console.log("\nDeployment index gate passed for staging and production.");
}

run().catch((error: any) => {
  console.error("\nDeployment index gate failed:", error?.message || error);
  process.exitCode = 1;
});
