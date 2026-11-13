import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/authServer";
import NotificationModel from "@/models/Notification";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;
  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, error: "Invalid notification ID." }, { status: 400 });
  await dbConnect();
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: id, recipient: user.id },
    { $set: { read: true, updatedAt: new Date() } },
    { returnDocument: "after" }
  ).lean();
  if (!notification) return NextResponse.json({ success: false, error: "Notification not found." }, { status: 404 });
  const unreadCount = await NotificationModel.countDocuments({ recipient: user.id, read: false });
  return NextResponse.json({ success: true, data: notification, unreadCount }, { headers: { "Cache-Control": "private, no-store" } });
}
