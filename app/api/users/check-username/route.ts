import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import StoreModel from "@/models/Store";
import { getServerAuthUser } from "@/lib/authServer";
import { isValidUsernameFormat } from "@/lib/usernameUtils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username") || "";
    const candidate = rawUsername.replace(/^@/, "").trim().toLowerCase();

    if (!candidate) {
      return NextResponse.json(
        { available: false, error: "Username query parameter is required." },
        { status: 400 }
      );
    }

    if (candidate.length < 3) {
      return NextResponse.json(
        { available: false, error: "Username must be at least 3 characters." },
        { status: 200 }
      );
    }

    if (candidate.length > 8) {
      return NextResponse.json(
        { available: false, error: "Username must be at most 8 characters." },
        { status: 200 }
      );
    }

    if (!isValidUsernameFormat(candidate)) {
      return NextResponse.json(
        {
          available: false,
          error: "Username can only contain lowercase letters and numbers.",
        },
        { status: 200 }
      );
    }

    await dbConnect();

    // Determine current user if authenticated, to exclude own username
    const auth = await getServerAuthUser(req);
    const currentUserId = auth?.id || req.headers.get("x-campus-user-id") || null;

    const userQuery: any = { "profile.handle": candidate };
    if (currentUserId) {
      userQuery._id = { $ne: currentUserId };
    }

    const storeQuery: any = { slug: candidate };
    if (currentUserId) {
      storeQuery.ownerId = { $ne: currentUserId };
    }

    const [existingUser, existingStore] = await Promise.all([
      UserModel.findOne(userQuery).select("_id").lean(),
      StoreModel.findOne(storeQuery).select("_id").lean(),
    ]);

    if (existingUser || existingStore) {
      return NextResponse.json({
        available: false,
        username: candidate,
        message: "Username is already taken.",
      });
    }

    return NextResponse.json({
      available: true,
      username: candidate,
      message: "Username is available.",
    });
  } catch (error: any) {
    console.error("[GET /api/users/check-username] Error:", error);
    return NextResponse.json(
      { available: false, error: "Failed to check username availability." },
      { status: 500 }
    );
  }
}
