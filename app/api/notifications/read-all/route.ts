import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/authServer";
import NotificationModel from "@/models/Notification";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;
  await dbConnect();
  const result = await NotificationModel.updateMany(
    { recipient: user.id, read: false },
    { $set: { read: true, updatedAt: new Date() } }
  );
  return NextResponse.json({ success: true, updated: result.modifiedCount }, { headers: { "Cache-Control": "private, no-store" } });
}
