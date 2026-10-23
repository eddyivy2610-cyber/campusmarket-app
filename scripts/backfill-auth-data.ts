import fs from "node:fs/promises";
import mongoose from "mongoose";
import dbConnect from "../app/lib/dbConnect";
import UserModel from "../app/models/User";

async function readIds(argument: string) {
  const index = process.argv.indexOf(argument);
  if (index < 0) return [] as string[];
  return [...new Set((await fs.readFile(process.argv[index + 1], "utf8")).split(/\r?\n/).map((id) => id.trim()).filter(Boolean))];
}

async function main() {
  const verifiedIds = await readIds("--verified-ids-file");
  const onboardingIds = await readIds("--onboarding-ids-file");
  const dryRun = process.argv.includes("--dry-run");
  const apply = process.argv.includes("--apply");
  if (dryRun === apply) throw new Error("Specify exactly one of --dry-run or --apply.");
  if (!verifiedIds.length && !onboardingIds.length) throw new Error("Provide approved ID files.");
  if (apply && !process.argv.includes("--snapshot-confirmation")) throw new Error("--snapshot-confirmation is required for apply.");

  await dbConnect();
  const ids = [...new Set([...verifiedIds, ...onboardingIds])];
  const users = await UserModel.find({ _id: { $in: ids } }).select("_id role accountStatus emailVerified onboardingStep").lean();
  const missing = ids.filter((id) => !users.some((user) => String(user._id) === id));
  const updates = users.map((user) => ({
    id: String(user._id),
    setEmailVerified: verifiedIds.includes(String(user._id)) && !user.emailVerified,
    setOnboardingStep: onboardingIds.includes(String(user._id)) && !user.onboardingStep,
  })).filter((item) => item.setEmailVerified || item.setOnboardingStep);
  console.log(JSON.stringify({ mode: dryRun ? "dry-run" : "apply", requestedCount: ids.length, missingIds: missing, updates }, null, 2));
  if (dryRun) {
    await mongoose.disconnect();
    return;
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const update of updates) {
        const set: Record<string, unknown> = {};
        if (update.setEmailVerified) set.emailVerified = true;
        if (update.setOnboardingStep) set.onboardingStep = "profile_completed";
        await UserModel.updateOne({ _id: update.id }, { $set: set, $inc: { tokenVersion: 1 } }, { session });
      }
    });
  } finally {
    await session.endSession();
  }
  console.log(JSON.stringify({ appliedCount: updates.length }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Auth data backfill failed:", error?.message || error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
