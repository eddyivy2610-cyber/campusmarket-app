import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RadarPostModel from "@/models/RadarPost";
import { requireAuth } from "@/lib/authServer";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const query: any = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id, status: "active" }
      : { $or: [{ publicId: id }, { slug: id }], status: "active" };

    const post: any = await RadarPostModel.findOne(query).lean();
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Radar post not found." },
        { status: 404 }
      );
    }

    // Only return public fields; never the raw document
    return NextResponse.json({
      success: true,
      data: {
        id: String(post._id),
        requesterName: post.requesterName || "Campus Student",
        requesterHandle: post.requesterHandle || "student",
        requesterLocation: post.requesterLocation || "Main Campus",
        requesterAvatar: post.requesterAvatar || "",
        isVerified: Boolean(post.isVerified),
        requestText: post.requestText,
        category: post.category || "all",
        budget: post.budget || "",
        campus: post.campus || "Main Campus",
        createdAt: post.createdAt,
        replies: Array.isArray(post.replies)
          ? post.replies.map((r: any) => ({
              id: r.id || String(r._id),
              authorName: r.authorName,
              authorHandle: r.authorHandle,
              authorDept: r.authorDept,
              authorAvatar: r.authorAvatar || "",
              parentReplyId: r.parentReplyId || null,
              replyToName: r.replyToName || null,
              isVerified: Boolean(r.isVerified),
              message: r.message,
              createdAt: r.createdAt,
            }))
          : [],
      },
    });
  } catch (error: any) {
    console.error("[GET /api/radar/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch post." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { id } = await context.params;
    await dbConnect();

    const query: any = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { $or: [{ publicId: id }, { slug: id }] };

    const post = await RadarPostModel.findOne(query);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Radar post not found." },
        { status: 404 }
      );
    }

    const isOwner = String(post.userId) === String(user.id);
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to delete this post." },
        { status: 403 }
      );
    }

    await RadarPostModel.findByIdAndDelete(post._id);

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/radar/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete post." },
      { status: 500 }
    );
  }
}
