import { UploadPurpose } from "./uploadPolicy";

export interface ClientUploadResult {
  url: string;
  success: boolean;
  isPrivate?: boolean;
  error?: string;
}

/**
 * Uploads a file securely:
 * 1. Obtains signed direct upload parameters from /api/upload/sign.
 * 2. Directly uploads file bytes to Cloudinary without streaming through Vercel lambda.
 * 3. Falls back to /api/upload if direct Cloudinary upload is unavailable or in development.
 */
export async function uploadFileClient(
  file: File,
  purpose: UploadPurpose = "listing_image"
): Promise<ClientUploadResult> {
  const token = typeof window !== "undefined" ? localStorage.getItem("campus_token") : null;
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  // Extract file extension
  const fileName = file.name || "file.jpg";
  const ext = fileName.includes(".") ? `.${fileName.split(".").pop()!.toLowerCase()}` : ".jpg";

  // 1. Request Signed Upload Authorization
  try {
    const signRes = await fetch("/api/upload/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        purpose,
        extension: ext,
        sizeBytes: file.size,
        filename: fileName,
      }),
    });

    if (signRes.ok) {
      const authData = await signRes.json();
      if (authData.success && authData.uploadUrl && authData.signature) {
        // Direct Client-to-Cloudinary upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", authData.apiKey);
        formData.append("timestamp", String(authData.timestamp));
        formData.append("signature", authData.signature);
        formData.append("folder", authData.folder);
        formData.append("public_id", authData.publicId);
        if (authData.allowedFormats) {
          formData.append("allowed_formats", authData.allowedFormats);
        }
        if (authData.maxFileSize) {
          formData.append("max_file_size", String(authData.maxFileSize));
        }
        if (authData.type === "authenticated") {
          formData.append("type", "authenticated");
        }

        const cloudRes = await fetch(authData.uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.secure_url) {
            return {
              success: true,
              url: cloudData.secure_url,
              isPrivate: authData.type === "authenticated",
            };
          }
        }
      }
    }
  } catch (directErr) {
    console.warn("[Upload] Direct upload failed, attempting fallback:", directErr);
  }

  // 2. Fallback to /api/upload
  try {
    const fallbackData = new FormData();
    fallbackData.append("file", file);
    fallbackData.append("purpose", purpose);

    const fallbackRes = await fetch("/api/upload", {
      method: "POST",
      headers: {
        ...authHeaders,
      },
      body: fallbackData,
    });

    const data = await fallbackRes.json();
    if (fallbackRes.ok && data.success && (data.url || data.urls?.[0])) {
      return {
        success: true,
        url: data.url || data.urls[0],
        isPrivate: data.isPrivate,
      };
    }

    return {
      success: false,
      url: "",
      error: data.error || "Upload failed. Please check file type and size.",
    };
  } catch (fallbackErr: any) {
    return {
      success: false,
      url: "",
      error: fallbackErr.message || "Failed to process upload.",
    };
  }
}
