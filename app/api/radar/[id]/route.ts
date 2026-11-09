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
      ? { _id: id }
      : { $or: [{ _id: id }, { publicId: id }, { slug: id }] };

    const post = await RadarPostModel.findOne(query).lean();
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Radar post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: post });
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
      : { $or: [{ _id: id }, { publicId: id }, { slug: id }] };

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
