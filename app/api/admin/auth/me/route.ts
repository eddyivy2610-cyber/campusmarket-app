import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authServer";

export async function GET(req: NextRequest) {
  const { admin, errorResponse } = await requireAdmin(req);
  if (errorResponse || !admin) {
    return errorResponse;
  }

  return NextResponse.json({
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
}
