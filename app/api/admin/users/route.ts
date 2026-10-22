import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { requireAdmin } from "@/lib/authServer";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Admin endpoint to list and search registered users.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();
    if (UserModel.db?.readyState !== 1) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const filter: Record<string, any> = {};

    if (status && status !== "all") {
      filter.accountStatus = status;
    }
    if (role && role !== "all") {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "profile.displayName": { $regex: search, $options: "i" } },
      ];
    }

    const users = await UserModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/users] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve users." },
      { status: 500 }
    );
  }
}
