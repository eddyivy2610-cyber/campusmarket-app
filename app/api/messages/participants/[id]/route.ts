import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/authServer";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { ChatParticipantProfile } from "@/models/ChatModels";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;

  const { id } = await context.params;
  const ref = String(id || "").trim();
  if (!ref || ref.length > 120) {
    return NextResponse.json(
      { success: false, error: "Valid participant reference is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    let storeDoc: any = null;
    if (mongoose.isValidObjectId(ref)) {
      storeDoc = await StoreModel.findOne({ _id: ref, status: "active" })
        .select("ownerId slug name description logo isVerified")
        .lean();
    }
    if (!storeDoc) {
      storeDoc = await StoreModel.findOne({ slug: ref.toLowerCase(), status: "active" })
        .select("ownerId slug name description logo isVerified")
        .lean();
    }

    const targetUserId = storeDoc?.ownerId ? String(storeDoc.ownerId) : ref;
    const userDoc: any = mongoose.isValidObjectId(targetUserId)
      ? await UserModel.findById(targetUserId)
          .select("name email campus studentVerified avatar profile role")
          .lean()
      : null;

    if (!storeDoc && userDoc?._id) {
      storeDoc = await StoreModel.findOne({ ownerId: userDoc._id, status: "active" })
        .select("ownerId slug name description logo isVerified")
        .lean();
    }

    if (!userDoc && !storeDoc) {
      return NextResponse.json(
        { success: false, error: "Participant not found" },
        { status: 404 }
      );
    }

    const hasStore = Boolean(storeDoc);
    const profile: ChatParticipantProfile = {
      id: userDoc?._id ? String(userDoc._id) : targetUserId,
      name:
        storeDoc?.name ||
        userDoc?.profile?.displayName ||
        userDoc?.name ||
        "Campus Member",
      subtitle: hasStore
        ? storeDoc?.description || userDoc?.campus || "Campus Store"
        : userDoc?.profile?.bio || userDoc?.campus || "Campus Member",
      avatar:
        storeDoc?.logo ||
        userDoc?.profile?.avatar ||
        userDoc?.avatar ||
        undefined,
      isVerified: Boolean(userDoc?.studentVerified || storeDoc?.isVerified),
      accountType: hasStore ? "student_store" : "student",
      storeSlug: storeDoc?.slug || undefined,
      hasStore,
    };

    return NextResponse.json(
      { success: true, data: profile },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (err) {
    console.error("[GET /api/messages/participants/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to load participant" },
      { status: 500 }
    );
  }
}
