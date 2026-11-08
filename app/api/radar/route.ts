import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RadarPostModel from "@/models/RadarPost";
import UserModel from "@/models/User";
import { requireAuth } from "@/lib/authServer";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const campus = searchParams.get("campus");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "40", 10)));

    const filter: Record<string, any> = { status: "active" };
    if (category && category !== "all") {
      filter.category = category;
    }
    if (campus && campus !== "all") {
      filter.campus = campus;
    }

    const posts = await RadarPostModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const mapped = posts.map((p: any) => ({
      id: String(p._id),
      userId: String(p.userId),
      requesterName: p.requesterName || "Campus Student",
      requesterHandle: p.requesterHandle || "student",
      requesterLocation: p.requesterLocation || "Main Campus",
      requesterAvatar: p.requesterAvatar || "",
      isVerified: Boolean(p.isVerified),
      requestText: p.requestText,
      category: p.category || "all",
      budget: p.budget || "",
      campus: p.campus || "Main Campus",
      timeAgo: formatTimeAgo(p.createdAt),
      replies: Array.isArray(p.replies)
        ? p.replies.map((r: any) => ({
            id: r.id || String(r._id),
            userId: String(r.userId),
            authorName: r.authorName,
            authorHandle: r.authorHandle,
            authorDept: r.authorDept,
            authorAvatar: r.authorAvatar,
            isVerified: Boolean(r.isVerified),
            message: r.message,
            authorTime: formatTimeAgo(r.createdAt),
          }))
        : [],
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error("[GET /api/radar] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load radar requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const body = await req.json();
    const requestText = typeof body.requestText === "string" ? body.requestText.trim() : "";
    if (!requestText) {
      return NextResponse.json(
        { success: false, error: "Request description is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch latest user profile details
    const dbUser = await UserModel.findById(user.id).lean();
    const displayName =
      dbUser?.profile?.displayName ||
      dbUser?.name ||
      user.name ||
      "Campus Student";
    const handle =
      dbUser?.profile?.handle ||
      user.email?.split("@")[0] ||
      "student";
    const avatar =
      dbUser?.profile?.avatar ||
      "";
    const location =
      body.location ||
      dbUser?.campus ||
      user.campus ||
      "Main Campus";
    const isVerified = Boolean(dbUser?.studentVerified ?? user.studentVerified);

    const postDoc = await RadarPostModel.create({
      userId: user.id,
      requesterName: displayName,
      requesterHandle: handle,
      requesterLocation: location,
      requesterAvatar: avatar,
      isVerified,
      requestText,
      category: body.category || "all",
      budget: body.budget || "",
      campus: location,
      status: "active",
      replies: [],
    });

    const created = {
      id: String(postDoc._id),
      userId: user.id,
      requesterName: displayName,
      requesterHandle: handle,
      requesterLocation: location,
      requesterAvatar: avatar,
      isVerified,
      requestText,
      category: postDoc.category,
      budget: postDoc.budget,
      campus: postDoc.campus,
      timeAgo: "Just now",
      replies: [],
    };

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/radar] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to post radar request" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(dateInput: any): string {
  try {
    const d = new Date(dateInput);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}
