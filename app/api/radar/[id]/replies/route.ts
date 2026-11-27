import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import RadarPostModel from "@/models/RadarPost";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
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
    if (message.length > 500) {
      return NextResponse.json({ success: false, error: "Reply must be 500 characters or fewer." }, { status: 400 });
    }

    await dbConnect();

    const post = await RadarPostModel.findById(id);
    if (!post || (post as any).status !== "active") {
      return NextResponse.json({ success: false, error: "Radar post not found" }, { status: 404 });
    }

    const existingReplies: any[] = Array.isArray(post.replies) ? (post.replies as any[]) : [];
    if (existingReplies.length >= 100) {
      return NextResponse.json(
        { success: false, error: "This request has reached the maximum number of replies." },
        { status: 409 }
      );
    }
    if (existingReplies.filter((r) => String(r?.userId) === user.id).length >= 10) {
      return NextResponse.json(
        { success: false, error: "You've replied to this request too many times. Try messaging the poster instead." },
        { status: 429 }
      );
    }

    const rawParentId =
      typeof body.parentReplyId === "string" ? body.parentReplyId.trim() : "";
    let resolvedParentReplyId: string | null = null;
    let resolvedReplyToName: string | null = null;
    if (rawParentId) {
      const targetReply = existingReplies.find((r) => String(r?.id) === rawParentId);
      if (!targetReply) {
        return NextResponse.json(
          { success: false, error: "The reply you are responding to was not found." },
          { status: 404 }
        );
      }
      resolvedParentReplyId =
        typeof targetReply.parentReplyId === "string" && targetReply.parentReplyId
          ? targetReply.parentReplyId
          : String(targetReply.id);
      resolvedReplyToName =
        typeof targetReply.authorName === "string" && targetReply.authorName
          ? targetReply.authorName
          : null;
    }

    const [dbUser, activeStore]: [any, any] = await Promise.all([
      UserModel.findById(user.id).lean(),
      StoreModel.findOne({ ownerId: String(user.id), status: "active" })
        .select("name slug logo campus isVerified")
        .lean(),
    ]);

    const authorName = activeStore?.name
      ? String(activeStore.name)
      : dbUser?.profile?.displayName ||
        dbUser?.name ||
        user.name ||
        "Campus Member";
    const authorHandle = activeStore?.slug
      ? String(activeStore.slug)
      : dbUser?.profile?.handle ||
        user.email?.split("@")[0] ||
        "member";
    const authorAvatar = activeStore?.logo
      ? String(activeStore.logo)
      : dbUser?.profile?.avatar || "";
    const authorStoreSlug = activeStore?.slug ? String(activeStore.slug) : null;
    const authorDept = activeStore?.campus
      ? String(activeStore.campus)
      : dbUser?.campus || user.campus || "Main Campus";
    const isVerified = Boolean(
      activeStore?.isVerified || dbUser?.studentVerified || user.studentVerified
    );

    const newReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      authorName,
      authorHandle,
      authorDept,
      authorAvatar,
      authorStoreSlug,
      parentReplyId: resolvedParentReplyId,
      replyToName: resolvedReplyToName,
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
