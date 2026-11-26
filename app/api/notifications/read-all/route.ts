import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/authServer";
import NotificationModel from "@/models/Notification";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const hasIds = Array.isArray(body?.ids);
  const validIds = hasIds
    ? body.ids.filter((id: unknown): id is string => typeof id === "string" && mongoose.isValidObjectId(id))
    : [];

  let modifiedCount = 0;
  if (!hasIds) {
    const result = await NotificationModel.updateMany(
      { recipient: user.id, read: false },
      { $set: { read: true, updatedAt: new Date() } }
    );
    modifiedCount = result.modifiedCount;
  } else if (validIds.length > 0) {
    const result = await NotificationModel.updateMany(
      { recipient: user.id, _id: { $in: validIds }, read: false },
      { $set: { read: true, updatedAt: new Date() } }
    );
    modifiedCount = result.modifiedCount;
  }

  const unreadCount = await NotificationModel.countDocuments({ recipient: user.id, read: false });
  return NextResponse.json(
    { success: true, updated: modifiedCount, unreadCount },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
