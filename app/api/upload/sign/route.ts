import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authServer";
import {
  authorizeDirectUpload,
  checkUploadRateLimit,
  UploadPurpose,
} from "@/lib/uploadPolicy";
import { StorageUnconfiguredError } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload/sign
 * Server-authorizes a direct client-to-Cloudinary upload:
 * - Enforces active authenticated session (rejects unauthenticated or suspended/inactive users).
 * - Enforces rate limiting (max 30 authorizations / 5 min).
 * - Enforces upload purpose and strict file-format whitelist.
 * - Generates server-controlled folder path scoped to authenticated user (`campushive/.../{userId}`).
 * - Generates server-derived UUID public ID.
 * - Computes sorted SHA-1 Cloudinary signature without exposing API secret.
 * - Isolates private business documents with access type: "authenticated".
 * - Issues asset verification token for server-side integrity validation upon persistence.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    // Rate limiting
    if (!checkUploadRateLimit(user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many upload requests. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const purpose = (body.purpose || "listing_image") as UploadPurpose;
    let extension = (body.extension || body.format || "").toString().trim();
    if (!extension && typeof body.filename === "string") {
      const match = body.filename.match(/\.[a-zA-Z0-9]+$/);
      if (match) {
        extension = match[0];
      }
    }
    if (!extension && typeof body.mimeType === "string") {
      const mime = body.mimeType.toLowerCase();
      if (mime === "image/jpeg" || mime === "image/jpg") extension = ".jpg";
      else if (mime === "image/png") extension = ".png";
      else if (mime === "image/webp") extension = ".webp";
      else if (mime === "application/pdf") extension = ".pdf";
      else extension = ".bin";
    }
    if (!extension) {
      extension = ".jpg";
    }

    const sizeBytes =
      typeof body.sizeBytes === "number"
        ? body.sizeBytes
        : typeof body.fileSize === "number"
        ? body.fileSize
        : undefined;

    const authorization = authorizeDirectUpload(user, {
      purpose,
      extension,
      sizeBytes,
    });

    return NextResponse.json({
      success: true,
      ...authorization,
    });
  } catch (error: any) {
    console.error("[POST /api/upload/sign] Error:", error);
    if (
      error instanceof StorageUnconfiguredError ||
      error?.statusCode === 503 ||
      error.message?.includes("unconfigured in production")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloud storage is unconfigured. Direct uploads are unavailable.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to authorize upload.",
      },
      { status: 400 }
    );
  }
}
