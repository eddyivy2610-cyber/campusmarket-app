import mongoose from "mongoose";
import dbConnect from "../app/lib/dbConnect";
import UserModel from "../app/models/User";

type Candidate = {
  id: string;
  createdAt?: string;
  role: string;
  accountStatus: string;
  emailVerified: boolean;
  counts: Record<string, number>;
};

async function count(collection: string, filter: Record<string, unknown>) {
  return mongoose.connection.collection(collection).countDocuments(filter);
}

async function main() {
  await dbConnect();
  const users = await UserModel.find({ role: { $ne: "admin" } })
    .select("_id createdAt role accountStatus emailVerified")
    .lean();
  const output: Candidate[] = [];

  for (const user of users) {
    const id = String(user._id);
    const oid = mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id;
    output.push({
      id,
      createdAt: user.createdAt,
      role: String(user.role || "buyer"),
      accountStatus: String(user.accountStatus || "pending"),
      emailVerified: Boolean(user.emailVerified),
      counts: {
        stores: await count("stores", { ownerId: id }),
        listings: await count("listings", { sellerId: id }),
        messages: await count("messages", { senderId: id }),
        conversations: await count("conversations", {
          $or: [{ participantIds: id }, { participants: oid }],
        }),
      },
    });
  }

  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), candidates: output }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Account candidate export failed:", error?.message || error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
