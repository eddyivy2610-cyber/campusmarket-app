import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authServer";
import { uploadFileSecurely, StorageUnconfiguredError } from "@/lib/storage";
import {
  UPLOAD_POLICIES,
  UploadPurpose,
  checkUploadRateLimit,
} from "@/lib/uploadPolicy";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload
 * Secure, authenticated file upload handler:
 * - Enforces authenticated session.
 * - Rate limits upload attempts per user.
 * - Validates binary magic numbers (blocks disguised executables, scripts, SVG XSS).
 * - Enforces unpredictable UUID filenames (prevents path traversal and file overwrites).
 * - Persists to Cloudinary object storage when configured.
 * - Isolates private business verification documents from public web directories.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Strict Authentication
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    if (!checkUploadRateLimit(user.id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many upload requests. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const incomingFiles: File[] = [];

    // Collect files
    ["files", "images", "document", "file"].forEach((key) => {
      const items = formData.getAll(key);
      items.forEach((item) => {
        if (item instanceof File && item.size > 0) {
          incomingFiles.push(item);
        }
      });
    });

    if (incomingFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided for upload." },
        { status: 400 }
      );
    }

    const rawPurpose = (formData.get("purpose")?.toString() || "listing_image") as UploadPurpose;
    const purpose: UploadPurpose = UPLOAD_POLICIES[rawPurpose]
      ? rawPurpose
      : "listing_image";
    const policy = UPLOAD_POLICIES[purpose];
    const isPrivate = policy.accessType === "authenticated";

    const urls: string[] = [];

    for (const file of incomingFiles) {
      // 2. Size limit per policy
      if (file.size > policy.maxSizeBytes) {
        const maxMb = policy.maxSizeBytes / (1024 * 1024);
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds the maximum allowed size of ${maxMb}MB for ${purpose}.`,
          },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 3. Process via secure upload coordinator
      const result = await uploadFileSecurely({
        buffer,
        originalName: file.name,
        declaredMimeType: file.type,
        isPrivate,
        userId: user.id,
        purpose,
      });

      urls.push(result.url);
    }

    return NextResponse.json({
      success: true,
      urls,
      url: urls[0],
      isPrivate,
    });
  } catch (error: any) {
    console.error("[POST /api/upload] Error:", error);
    if (error instanceof StorageUnconfiguredError || error?.statusCode === 503) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Cloud storage is unconfigured. Uploads are unavailable.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process and store file.",
      },
      { status: 400 }
    );
  }
}
