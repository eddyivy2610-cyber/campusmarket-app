import { UploadPurpose } from "./uploadPolicy";

export interface ClientUploadResult {
  url: string;
  success: boolean;
  isPrivate?: boolean;
  error?: string;
}

/**
 * Converts a File to a compact base64 Data URL in the browser as a resilient fallback
 * when cloud object storage is temporarily unreachable or unconfigured.
 */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an image and we're in the browser, resize/compress via canvas so MongoDB document stays small
    if (typeof window !== "undefined" && file.type.startsWith("image/") && file.type !== "image/gif") {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        try {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.82);
            resolve(compressed);
            return;
          }
        } catch {}
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
      };
      img.src = objUrl;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
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
  const authHeaders: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("campus_access_token");
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }

  // Extract file extension
  const fileName = file.name || "file.jpg";
  const ext = fileName.includes(".") ? `.${fileName.split(".").pop()!.toLowerCase()}` : ".jpg";

  // 1. Request Signed Upload Authorization
  try {
    const signRes = await fetch("/api/upload/sign", {
      method: "POST",
      credentials: "include",
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
      credentials: "include",
      headers: {
        ...authHeaders,
      },
      body: fallbackData,
    });

    const data = await fallbackRes.json().catch(() => ({}));
    if (fallbackRes.ok && data.success && (data.url || data.urls?.[0])) {
      return {
        success: true,
        url: data.url || data.urls[0],
        isPrivate: data.isPrivate,
      };
    }

    // 3. Resilient inline Data URL fallback if Cloudinary is unconfigured (503) or unreachable
    if (fallbackRes.status === 503 || fallbackRes.status >= 500) {
      const dataUrl = await readFileAsDataUrl(file);
      if (dataUrl) {
        return {
          success: true,
          url: dataUrl,
          isPrivate: purpose === "business_document",
        };
      }
    }

    return {
      success: false,
      url: "",
      error: data.error || "Upload failed. Please check file type and size.",
    };
  } catch (fallbackErr: any) {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (dataUrl) {
        return {
          success: true,
          url: dataUrl,
          isPrivate: purpose === "business_document",
        };
      }
    } catch {}
    return {
      success: false,
      url: "",
      error: fallbackErr.message || "Failed to process upload.",
    };
  }
}
