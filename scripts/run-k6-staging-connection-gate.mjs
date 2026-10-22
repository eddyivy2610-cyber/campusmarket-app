import { spawn } from "node:child_process";
import mongoose from "mongoose";

const baseUrl = process.env.BASE_URL;
const mongodbUri = process.env.ATLAS_STAGING_MONGODB_URI || process.env.MONGODB_URI;
const atlasTier = process.env.ATLAS_TIER;
const connectionLimit = Number(process.env.ATLAS_CONNECTION_LIMIT);
const threshold = connectionLimit * 0.8;
const tierConnectionLimits = { M0: 500, M2: 500, M5: 500, M10: 1500, M20: 3000 };

if (
  !baseUrl ||
  !mongodbUri ||
  !atlasTier ||
  !tierConnectionLimits[atlasTier] ||
  !Number.isFinite(connectionLimit) ||
  connectionLimit !== tierConnectionLimits[atlasTier]
) {
  console.error(
    "BASE_URL, Atlas tier, ATLAS_STAGING_MONGODB_URI (or MONGODB_URI), and the tier-matched ATLAS_CONNECTION_LIMIT are required."
  );
  process.exit(1);
}

let peakConnections = 0;
let samplingError = null;
let stoppingForConnections = false;
let loadProcess;
let samples = 0;

async function sampleConnections() {
  try {
    const status = await mongoose.connection.db.admin().serverStatus();
    const current = Number(status.connections?.current || 0);
    samples += 1;
    peakConnections = Math.max(peakConnections, current);
    console.log(
      `[Atlas] connections=${current} limit=${connectionLimit} usage=${((current / connectionLimit) * 100).toFixed(1)}%`
    );
    if (current >= threshold && !stoppingForConnections) {
      stoppingForConnections = true;
      samplingError = new Error(
        `Atlas connection usage reached ${(current / connectionLimit * 100).toFixed(1)}%; required <80%.`
      );
      loadProcess.kill("SIGTERM");
    }
  } catch (error) {
    samplingError = error;
    if (!stoppingForConnections) {
      stoppingForConnections = true;
      loadProcess.kill("SIGTERM");
    }
  }
}

await mongoose.connect(mongodbUri, { serverSelectionTimeoutMS: 15_000 });

loadProcess = spawn("k6", ["run", "scripts/k6-phase3-load.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    BASE_URL: baseUrl,
    K6_MAX_VUS: "100",
  },
});

await sampleConnections();
const sampler = setInterval(sampleConnections, Number(process.env.ATLAS_SAMPLE_INTERVAL_MS || 250));

const exitCode = await new Promise((resolve) => {
  loadProcess.on("close", (code) => resolve(code ?? 1));
});

clearInterval(sampler);
await mongoose.disconnect();

if (samplingError) {
  console.error(`\nStaging connection gate failed: ${samplingError.message}`);
  process.exit(1);
}

if (exitCode !== 0) {
  console.error(`\nk6 failed with exit code ${exitCode}.`);
  process.exit(exitCode);
}

console.log(
  `\nStaging connection gate passed: peak Atlas connections ${peakConnections}/${connectionLimit} (${((peakConnections / connectionLimit) * 100).toFixed(1)}%) across ${samples} samples. This is a connection guardrail, not a latency or error-rate approval.`
);
