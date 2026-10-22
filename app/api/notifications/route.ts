import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/authServer";
import NotificationModel, { NOTIFICATION_CATEGORIES } from "@/models/Notification";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  category: z.enum(["all", ...NOTIFICATION_CATEGORIES]).default("all"),
  unread: z.enum(["true", "false"]).default("false"),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;
  try {
    await dbConnect();
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid notification query." }, { status: 400 });
    const { category, unread, cursor, limit } = parsed.data;
    const filter: Record<string, any> = { recipient: user.id };
    if (category !== "all") filter.category = category;
    if (unread === "true") filter.read = false;
    if (cursor) {
      const date = new Date(cursor);
      if (Number.isNaN(date.getTime())) return NextResponse.json({ success: false, error: "Invalid notification cursor." }, { status: 400 });
      filter.createdAt = { $lt: date };
    }
    const [notifications, unreadCount] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit + 1).lean(),
      NotificationModel.countDocuments({ recipient: user.id, read: false }),
    ]);
    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;
    return NextResponse.json({
      success: true,
      data: items,
      unreadCount,
      nextCursor: hasMore ? items[items.length - 1]?.createdAt : null,
      hasMore,
    }, { headers: { "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate" } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to load notifications." }, { status: 500 });
  }
}
