import fs from "node:fs/promises";
import mongoose from "mongoose";
import dbConnect from "../app/lib/dbConnect";
import UserModel from "../app/models/User";

async function idsFromFile(argument: string): Promise<string[]> {
  const index = process.argv.indexOf(argument);
  if (index < 0) return [];
  return [...new Set((await fs.readFile(process.argv[index + 1], "utf8")).split(/\r?\n/).map((id) => id.trim()).filter(Boolean))];
}

async function main() {
  const excludedIds = await idsFromFile("--exclude-ids-file");
  await dbConnect();
  const exclusion = excludedIds.length ? { _id: { $nin: excludedIds } } : {};
  const activeUnverified = await UserModel.find({
    ...exclusion,
    accountStatus: "active",
    $or: [{ emailVerified: false }, { emailVerified: { $exists: false } }],
  }).select("_id createdAt role accountStatus emailVerified onboardingStep").lean();
  const admins = await UserModel.find({ ...exclusion, role: "admin", accountStatus: "active" })
    .select("_id createdAt role accountStatus emailVerified onboardingStep")
    .lean();
  const missingOnboarding = await UserModel.find({ ...exclusion, onboardingStep: { $exists: false } })
    .select("_id createdAt role accountStatus emailVerified onboardingStep")
    .lean();

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    excludedCount: excludedIds.length,
    activeUnverifiedCount: activeUnverified.length,
    activeUnverifiedIds: activeUnverified.map((user) => String(user._id)),
    activeAdminCount: admins.length,
    activeAdmins: admins.map((user) => ({ id: String(user._id), emailVerified: Boolean(user.emailVerified), onboardingStep: user.onboardingStep || null })),
    missingOnboardingCount: missingOnboarding.length,
    missingOnboardingIds: missingOnboarding.map((user) => String(user._id)),
  }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Auth data audit failed:", error?.message || error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
