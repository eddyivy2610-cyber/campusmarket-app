import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import RadarPostModel from "@/models/RadarPost";
import UserModel from "@/models/User";
import { requireAuth } from "@/lib/authServer";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ success: false, error: "Reply message is required" }, { status: 400 });
    }

    await dbConnect();

    const post = await RadarPostModel.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, error: "Radar post not found" }, { status: 404 });
    }

    const dbUser = await UserModel.findById(user.id).lean();
    const authorName =
      dbUser?.profile?.displayName ||
      dbUser?.name ||
      user.name ||
      "Campus Member";
    const authorHandle =
      dbUser?.profile?.handle ||
      user.email?.split("@")[0] ||
      "member";
    const authorAvatar =
      dbUser?.profile?.avatar ||
      "";
    const authorDept =
      dbUser?.campus ||
      user.campus ||
      "Main Campus";
    const isVerified = Boolean(dbUser?.studentVerified ?? user.studentVerified);

    const newReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      authorName,
      authorHandle,
      authorDept,
      authorAvatar,
      isVerified,
      message,
      createdAt: new Date(),
    };

    post.replies.push(newReply as any);
    await post.save();

    return NextResponse.json({
      success: true,
      data: {
        ...newReply,
        authorTime: "Just now",
      },
    });
  } catch (error: any) {
    console.error("[POST /api/radar/[id]/replies] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to post reply" },
      { status: 500 }
    );
  }
}
