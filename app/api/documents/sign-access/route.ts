import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authServer";
import { generatePrivateDocumentSignedDeliveryUrl } from "@/lib/uploadPolicy";

export const dynamic = "force-dynamic";

/**
 * POST /api/documents/sign-access
 * Generates a time-limited signed delivery URL for an authenticated business document:
 * 1. Requires active authenticated user.
 * 2. Verifies requester is either the document owner or an administrator.
 * 3. Enforces that public users cannot access private verification documents.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { documentUrl } = body;
    if (!documentUrl || typeof documentUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "documentUrl parameter is required." },
        { status: 400 }
      );
    }

    const result = generatePrivateDocumentSignedDeliveryUrl(documentUrl, user);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.statusCode || 403 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: result.signedUrl,
    });
  } catch (error: any) {
    console.error("[POST /api/documents/sign-access] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to authorize document access." },
      { status: 500 }
    );
  }
}
