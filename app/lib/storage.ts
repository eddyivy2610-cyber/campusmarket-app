import crypto from "node:crypto";
import type { UploadPurpose } from "./uploadPolicy";

export interface SecureUploadOptions {
  buffer: Buffer;
  originalName: string;
  declaredMimeType: string;
  isPrivate?: boolean;
  userId: string;
  purpose?: UploadPurpose;
}

export interface SecureUploadResult {
  url: string;
  storageProvider: "cloudinary" | "development_mock";
  isPrivate: boolean;
  fileKey: string;
  sizeBytes: number;
  mimeType: string;
  type: "upload" | "authenticated";
}

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  type: "upload" | "authenticated";
  uploadUrl: string;
}

export class StorageUnconfiguredError extends Error {
  statusCode: number;
  constructor(message = "Cloud storage is unconfigured. Uploads require Cloudinary in production.") {
    super(message);
    this.name = "StorageUnconfiguredError";
    this.statusCode = 503;
  }
}

/**
 * Validates actual binary content by verifying magic number signatures.
 * Blocks executable files, disguised scripts, or SVG XSS vectors.
 */
export function verifyFileSignature(buffer: Buffer): {
  valid: boolean;
  detectedMime?: string;
  extension?: string;
} {
  if (buffer.length < 4) return { valid: false };

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, detectedMime: "image/png", extension: ".png" };
  }

  // JPEG / JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: "image/jpeg", extension: ".jpg" };
  }

  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { valid: true, detectedMime: "image/gif", extension: ".gif" };
  }

  // WEBP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { valid: true, detectedMime: "image/webp", extension: ".webp" };
  }

  // PDF: %PDF (25 50 44 46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, detectedMime: "application/pdf", extension: ".pdf" };
  }

  return { valid: false };
}

/**
 * Generates signed direct upload parameters for client-side direct uploads to Cloudinary.
 * Prevents streaming multi-megabyte payloads through Vercel serverless function bandwidth.
 */
export function generateSignedUploadParams(options: {
  isPrivate?: boolean;
  purpose?: string;
  folder?: string;
} = {}): SignedUploadParams {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const isPrivate = options.isPrivate || options.purpose === "business_document";
  const folder = options.folder || (isPrivate ? "campushive/private_docs" : "campushive/uploads");
  const type: "upload" | "authenticated" = isPrivate ? "authenticated" : "upload";

  if (!cloudName || !apiKey || !apiSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new StorageUnconfiguredError();
    }
    // Development fallback
    return {
      signature: "dev_mock_signature",
      timestamp: Math.round(Date.now() / 1000),
      apiKey: apiKey || "dev_key",
      cloudName: cloudName || "dev_cloud",
      folder,
      type,
      uploadUrl: "https://api.cloudinary.com/v1_1/mock/auto/upload",
    };
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Cloudinary signature parameters must be sorted alphabetically
  const signaturePayload =
    type === "authenticated"
      ? `folder=${folder}&timestamp=${timestamp}&type=authenticated${apiSecret}`
      : `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  const signature = crypto
    .createHash("sha1")
    .update(signaturePayload)
    .digest("hex");

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    type,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
  };
}

/**
 * Uploads a file buffer to Cloudinary Object Storage.
 * Uses type: "authenticated" for private business verification documents.
 * Never writes to local disk.
 */
async function uploadToCloudinary(
  buffer: Buffer,
  extension: string,
  isPrivate: boolean
): Promise<{ url: string; type: "upload" | "authenticated" } | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new StorageUnconfiguredError();
    }
    return null;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = isPrivate ? "campushive/private_docs" : "campushive/uploads";
    const resourceType = extension === ".pdf" ? "raw" : "image";
    const type: "upload" | "authenticated" = isPrivate ? "authenticated" : "upload";

    // Alphabetical sort for signature
    const signaturePayload =
      type === "authenticated"
        ? `folder=${folder}&timestamp=${timestamp}&type=authenticated${apiSecret}`
        : `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

    const signature = crypto
      .createHash("sha1")
      .update(signaturePayload)
      .digest("hex");

    const formData = new FormData();
    const base64Data = buffer.toString("base64");
    const mimePrefix = extension === ".pdf" ? "application/pdf" : `image/${extension.replace(".", "")}`;
    formData.append("file", `data:${mimePrefix};base64,${base64Data}`);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);
    if (type === "authenticated") {
      formData.append("type", "authenticated");
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url) {
      return { url: data.secure_url, type };
    }
    console.warn("[Cloudinary] Upload failed response:", data);
    return null;
  } catch (err: any) {
    if (err instanceof StorageUnconfiguredError) throw err;
    console.warn("[Cloudinary] Connection error:", err.message);
    if (process.env.NODE_ENV === "production") {
      throw new StorageUnconfiguredError(`Cloudinary connection error: ${err.message}`);
    }
    return null;
  }
}

/**
 * Secure upload coordinator:
 * 1. Validates magic byte signatures (blocks shell scripts, html/svg xss, executables).
 * 2. Enforces Cloudinary in production (throws 503 StorageUnconfiguredError if unconfigured).
 * 3. Never writes to ephemeral local disk (Vercel serverless durable).
 * 4. Isolates private business verification documents with type: "authenticated".
 */
export async function uploadFileSecurely(
  opts: SecureUploadOptions
): Promise<SecureUploadResult> {
  const { buffer, isPrivate = false } = opts;

  // 1. Validate file content signature
  const signature = verifyFileSignature(buffer);
  if (!signature.valid || !signature.extension || !signature.detectedMime) {
    throw new Error(
      "Security rejection: Invalid or malicious file content. Only authentic JPG, PNG, WEBP, GIF, and PDF files are allowed."
    );
  }

  const fileKey = crypto.randomUUID();

  // 2. Upload to Cloudinary (required in production; type: "authenticated" for private docs)
  const cloudResult = await uploadToCloudinary(
    buffer,
    signature.extension,
    isPrivate
  );

  if (cloudResult) {
    return {
      url: cloudResult.url,
      storageProvider: "cloudinary",
      isPrivate,
      fileKey,
      sizeBytes: buffer.length,
      mimeType: signature.detectedMime,
      type: cloudResult.type,
    };
  }

  // 3. Development only fallback (NO local disk writes)
  if (process.env.NODE_ENV === "production") {
    throw new StorageUnconfiguredError();
  }

  const mockType = isPrivate ? "authenticated" : "upload";
  return {
    url: `https://res.cloudinary.com/campushive-dev/${mockType}/v1/campushive/${isPrivate ? "private_docs" : "uploads"}/${fileKey}${signature.extension}`,
    storageProvider: "development_mock",
    isPrivate,
    fileKey,
    sizeBytes: buffer.length,
    mimeType: signature.detectedMime,
    type: mockType,
  };
}
