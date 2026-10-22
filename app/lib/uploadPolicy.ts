import crypto from "node:crypto";
import { ServerAuthUser } from "./authTokens";

export type UploadPurpose =
  | "avatar"
  | "cover_image"
  | "store_logo"
  | "store_cover"
  | "listing_image"
  | "business_document"
  | "banner_image";

export interface PurposePolicy {
  purpose: UploadPurpose;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes: number;
  accessType: "upload" | "authenticated";
  resourceType: "image" | "raw";
  folderPrefix: string;
}

export const UPLOAD_POLICIES: Record<UploadPurpose, PurposePolicy> = {
  avatar: {
    purpose: "avatar",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    accessType: "upload",
    resourceType: "image",
    folderPrefix: "campushive/users",
  },
  cover_image: {
    purpose: "cover_image",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 8 * 1024 * 1024, // 8MB
    accessType: "upload",
    resourceType: "image",
    folderPrefix: "campushive/users",
  },
  store_logo: {
    purpose: "store_logo",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    accessType: "upload",
    resourceType: "image",
    folderPrefix: "campushive/stores",
  },
  store_cover: {
    purpose: "store_cover",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 8 * 1024 * 1024, // 8MB
    accessType: "upload",
    resourceType: "image",
    folderPrefix: "campushive/stores",
  },
  listing_image: {
    purpose: "listing_image",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    accessType: "upload",
    resourceType: "image",
    folderPrefix: "campushive/listings",
  },
  business_document: {
    purpose: "business_document",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    accessType: "authenticated", // Private isolated access
    resourceType: "raw", // Raw for PDFs or image for pictures
    folderPrefix: "campushive/private_docs",
  },
  banner_image: {
    purpose: "banner_image",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 8 * 1024 * 1024, // 8MB
    accessType: "upload",
    resourceType: "image",
    folderPrefix: "campushive/banners",
  },
};

// Rate limiter: Max 30 upload signing authorizations per 5 minutes per user
const uploadAuthRateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 5 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 30;

export function checkUploadRateLimit(key: string): boolean {
  if (!key) return true;
  const now = Date.now();
  const timestamps = (uploadAuthRateMap.get(key) || []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= MAX_UPLOADS_PER_WINDOW) {
    uploadAuthRateMap.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  uploadAuthRateMap.set(key, timestamps);
  return true;
}

export function resetUploadRateLimits(): void {
  uploadAuthRateMap.clear();
}

/**
 * Validates request parameters against the target upload policy.
 */
export function validateUploadParameters(params: {
  purpose: string;
  extension: string;
  sizeBytes?: number;
}): { valid: boolean; error?: string; policy?: PurposePolicy } {
  const policy = UPLOAD_POLICIES[params.purpose as UploadPurpose];
  if (!policy) {
    return {
      valid: false,
      error: `Invalid upload purpose: "${params.purpose}". Allowed purposes: ${Object.keys(
        UPLOAD_POLICIES
      ).join(", ")}.`,
    };
  }

  const ext = params.extension.startsWith(".")
    ? params.extension.toLowerCase()
    : `.${params.extension.toLowerCase()}`;

  if (!policy.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file format "${ext}" for purpose "${policy.purpose}". Allowed formats: ${policy.allowedExtensions.join(
        ", "
      )}.`,
    };
  }

  if (params.sizeBytes && params.sizeBytes > policy.maxSizeBytes) {
    const maxMb = policy.maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds the maximum allowed limit of ${maxMb}MB for ${policy.purpose}.`,
    };
  }

  return { valid: true, policy };
}

export interface DirectUploadAuthorization {
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  publicId: string;
  type: "upload" | "authenticated";
  resourceType: "image" | "raw";
  allowedFormats: string;
  maxFileSize: number;
  signature: string;
  assetVerificationToken: string;
}

/**
 * Generates cryptographic authorization ticket validating that a persisted asset URL
 * matches the exact user, purpose, and public ID authorized by the server.
 */
export function generateAssetVerificationToken(
  userId: string,
  purpose: UploadPurpose,
  publicId: string,
  type: string
): string {
  const secret = process.env.AUTH_SECRET || "campushive-asset-verification-secret-32-chars";
  return crypto
    .createHmac("sha256", secret)
    .update(`${userId}:${purpose}:${publicId}:${type}`)
    .digest("hex");
}

export interface StructuralCloudinaryAsset {
  cloudName: string;
  resourceType: "image" | "raw";
  deliveryType: "upload" | "authenticated";
  folder: string;
  userId: string;
  publicId: string;
  filename: string;
  extension: string;
}

/**
 * Structurally parses a Cloudinary asset URL and validates:
 * 1. Protocol is strictly HTTPS.
 * 2. Hostname is strictly res.cloudinary.com (or approved development mock).
 * 3. Zero credentials, path traversals (..), or illegal characters.
 * 4. Cloud name strictly matches configured tenant account.
 * 5. Resource type matches policy ("image" vs "raw").
 * 6. Delivery type matches policy ("upload" for public, "authenticated" for private).
 * 7. Scoped folder hierarchy matches exact user ID.
 * 8. Public ID starts with expected purpose prefix and conforms to strict regex.
 * 9. File extension is within policy whitelist.
 */
export function parseAndValidateCloudinaryUrl(
  url: string,
  expectedUserId: string,
  expectedPurpose: UploadPurpose
): { valid: boolean; error?: string; asset?: StructuralCloudinaryAsset } {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "Empty or invalid URL" };
  }

  const policy = UPLOAD_POLICIES[expectedPurpose];
  if (!policy) {
    return { valid: false, error: `Invalid upload purpose: "${expectedPurpose}"` };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Malformed URL syntax" };
  }

  // 1. Protocol check
  if (parsed.protocol !== "https:") {
    return { valid: false, error: "Asset URL must use secure HTTPS protocol" };
  }

  // 2. Hostname check (strictly reject lookalike domains or phishing hosts)
  const isDevMock =
    !process.env.CLOUDINARY_CLOUD_NAME &&
    (parsed.hostname.includes("campushive-dev") || parsed.hostname === "localhost");
  const isProdHost = parsed.hostname === "res.cloudinary.com";
  if (!isProdHost && !isDevMock) {
    return {
      valid: false,
      error: `Untrusted asset host "${parsed.hostname}". Only res.cloudinary.com is authorized.`,
    };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, error: "Credentials forbidden in asset URL" };
  }

  // 3. Path Traversal & Illegal Character Protection
  const rawPath = decodeURIComponent(parsed.pathname);
  if (
    rawPath.includes("..") ||
    rawPath.includes("\\") ||
    rawPath.includes("\0") ||
    rawPath.includes("//") ||
    rawPath.includes("%2e%2e") ||
    rawPath.includes("%2E%2E")
  ) {
    return { valid: false, error: "Path traversal or illegal character detected in asset URL" };
  }

  // 4. Decompose and normalize path segments
  const segments = rawPath.split("/").filter(Boolean);
  if (segments.length < 5) {
    return { valid: false, error: "Insufficient path depth for Cloudinary asset" };
  }

  const [cloudName, resourceType, deliveryType, ...rest] = segments;

  // 5. Cloudinary account tenant verification
  const expectedCloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (expectedCloud && cloudName !== expectedCloud && !isDevMock) {
    return {
      valid: false,
      error: `Asset belongs to foreign Cloudinary account "${cloudName}". Expected "${expectedCloud}".`,
    };
  }

  // 6. Resource Type verification
  if (resourceType !== "image" && resourceType !== "raw") {
    return { valid: false, error: `Invalid resource type "${resourceType}"` };
  }
  if (expectedPurpose !== "business_document" && resourceType !== "image") {
    return {
      valid: false,
      error: `Public media must use resource type "image", got "${resourceType}"`,
    };
  }

  // 7. Delivery Type verification
  if (policy.accessType === "authenticated") {
    if (deliveryType !== "authenticated") {
      return {
        valid: false,
        error: "Private business documents must strictly use delivery type 'authenticated'",
      };
    }
  } else {
    if (deliveryType !== "upload") {
      return {
        valid: false,
        error: "Public marketplace assets cannot use private/authenticated delivery type",
      };
    }
  }

  // 8. Filter out transformations (e.g. "s--...--", "c_fill,w_300", "v1234567")
  const pathWithoutTransforms = rest.filter((seg) => {
    if (seg.startsWith("s--") && seg.endsWith("--")) return false; // Signature token
    if (/^v\d+$/.test(seg)) return false; // Version number
    if (
      seg.includes(",") ||
      seg.startsWith("c_") ||
      seg.startsWith("w_") ||
      seg.startsWith("h_") ||
      seg.startsWith("q_")
    ) {
      return false; // Transformation parameters
    }
    return true;
  });

  // Expected remaining: [ "campushive", <folderSubdir>, <userId>, <filename> ]
  const prefixParts = policy.folderPrefix.split("/").filter(Boolean); // e.g. ["campushive", "users"]
  const expectedDepth = prefixParts.length + 2; // prefix parts + userId + filename

  if (pathWithoutTransforms.length !== expectedDepth) {
    return {
      valid: false,
      error: `Invalid folder hierarchy depth for ${expectedPurpose}. Expected ${expectedDepth} segments, got ${pathWithoutTransforms.length}.`,
    };
  }

  // Check prefix hierarchy
  for (let i = 0; i < prefixParts.length; i++) {
    if (pathWithoutTransforms[i] !== prefixParts[i]) {
      return {
        valid: false,
        error: `Folder mismatch: expected "${prefixParts[i]}", got "${pathWithoutTransforms[i]}"`,
      };
    }
  }

  // Check user ID scoping
  const assetUserId = pathWithoutTransforms[prefixParts.length];
  if (assetUserId !== expectedUserId) {
    return {
      valid: false,
      error: `Asset does not belong to user. Expected user "${expectedUserId}", got "${assetUserId}"`,
    };
  }

  // Check Filename, Public ID & Extension
  const filename = pathWithoutTransforms[pathWithoutTransforms.length - 1];
  const fileMatch = filename.match(/^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9]+)$/);
  if (!fileMatch) {
    return { valid: false, error: `Malformed filename or public ID "${filename}"` };
  }

  const [_, publicIdWithoutExt, ext] = fileMatch;
  const canonicalExt = `.${ext.toLowerCase()}`;
  if (!policy.allowedExtensions.includes(canonicalExt)) {
    return {
      valid: false,
      error: `Format "${canonicalExt}" is not allowed for purpose "${expectedPurpose}"`,
    };
  }

  // Reject manipulated public IDs: must start with purpose prefix
  if (!publicIdWithoutExt.startsWith(`${expectedPurpose}_`) && !publicIdWithoutExt.startsWith(expectedPurpose)) {
    return {
      valid: false,
      error: `Public ID "${publicIdWithoutExt}" is not authorized for purpose "${expectedPurpose}"`,
    };
  }

  const folder = `${policy.folderPrefix}/${expectedUserId}`;
  const publicId = `${folder}/${publicIdWithoutExt}`;

  return {
    valid: true,
    asset: {
      cloudName,
      resourceType: resourceType as any,
      deliveryType: deliveryType as any,
      folder,
      userId: expectedUserId,
      publicId,
      filename,
      extension: canonicalExt,
    },
  };
}

/**
 * Verifies that an asset URL was legitimately authorized for this user and purpose.
 * Uses strict structural URL parsing and user-ownership verification.
 */
export function verifyAssetOwnership(
  url: string,
  userId: string,
  purpose: UploadPurpose
): boolean {
  const result = parseAndValidateCloudinaryUrl(url, userId, purpose);
  return result.valid;
}

/**
 * Verifies that an uploaded asset actually exists in Cloudinary with matching format and size
 * before attaching to a listing or user profile.
 */
export async function verifyAndInspectAsset(
  url: string,
  userId: string,
  purpose: UploadPurpose
): Promise<{ valid: boolean; error?: string; asset?: StructuralCloudinaryAsset }> {
  const parseResult = parseAndValidateCloudinaryUrl(url, userId, purpose);
  if (!parseResult.valid || !parseResult.asset) {
    return { valid: false, error: parseResult.error || "Asset validation failed" };
  }

  const asset = parseResult.asset;
  const policy = UPLOAD_POLICIES[purpose];
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  // In live production with Cloudinary configured: verify asset metadata with Cloudinary Admin API
  if (apiKey && apiSecret && cloudName) {
    try {
      const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
      const lookupUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${asset.resourceType}/${asset.deliveryType}/${encodeURIComponent(
        asset.publicId
      )}`;

      const res = await fetch(lookupUrl, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      });

      if (res.status === 404) {
        return {
          valid: false,
          error: "Asset does not exist in Cloudinary storage. Please upload the file first.",
        };
      }

      if (res.ok) {
        const data = await res.json();
        // 1. Verify byte size
        if (typeof data.bytes === "number" && data.bytes > policy.maxSizeBytes) {
          const maxMb = policy.maxSizeBytes / (1024 * 1024);
          return {
            valid: false,
            error: `Uploaded asset size (${(data.bytes / (1024 * 1024)).toFixed(
              2
            )}MB) exceeds maximum limit of ${maxMb}MB for ${purpose}.`,
          };
        }

        // 2. Verify format
        const remoteExt = `.${(data.format || "").toLowerCase()}`;
        if (data.format && !policy.allowedExtensions.includes(remoteExt)) {
          return {
            valid: false,
            error: `Uploaded asset format "${remoteExt}" is not permitted for ${purpose}.`,
          };
        }
      }
    } catch (networkErr: any) {
      console.warn("[Cloudinary] Asset metadata probe error:", networkErr.message);
      // If network probe fails, allow structural validity to stand in development/test
    }
  }

  return { valid: true, asset };
}

/**
 * Generates a time-limited signed delivery URL for viewing private authenticated documents.
 * Verifies that the requester is an admin or the owner of the document.
 */
export function generatePrivateDocumentSignedDeliveryUrl(
  assetUrl: string,
  requester: ServerAuthUser,
  expiresInSeconds = 600
): { success: boolean; signedUrl?: string; error?: string; statusCode?: number } {
  if (!assetUrl || typeof assetUrl !== "string") {
    return { success: false, error: "Missing asset URL", statusCode: 400 };
  }

  let targetUserId = requester.id;
  if (requester.role === "admin") {
    try {
      const parsedUrl = new URL(assetUrl);
      const segs = decodeURIComponent(parsedUrl.pathname).split("/").filter(Boolean);
      const privIndex = segs.indexOf("private_docs");
      if (privIndex !== -1 && segs[privIndex + 1]) {
        targetUserId = segs[privIndex + 1];
      }
    } catch {
      return { success: false, error: "Malformed document URL", statusCode: 400 };
    }
  }

  const parsed = parseAndValidateCloudinaryUrl(assetUrl, targetUserId, "business_document");
  if (!parsed.valid || !parsed.asset) {
    return {
      success: false,
      error: requester.role === "admin" ? parsed.error : "Forbidden: You are not authorized to view this private document.",
      statusCode: requester.role === "admin" ? 400 : 403,
    };
  }

  const asset = parsed.asset;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "campushive-dev";

  if (!apiSecret) {
    return {
      success: true,
      signedUrl: `${assetUrl}?signed_token=dev_mock_token&expires=${Date.now() + expiresInSeconds * 1000}`,
    };
  }

  const expiresAt = Math.round(Date.now() / 1000) + expiresInSeconds;
  const toSign = `${asset.publicId}${expiresAt}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex").slice(0, 16);

  const signedDeliveryUrl = `https://res.cloudinary.com/${cloudName}/${asset.resourceType}/authenticated/s--${signature}--/v${expiresAt}/${asset.publicId}${asset.extension}`;

  return {
    success: true,
    signedUrl: signedDeliveryUrl,
  };
}

/**
 * Authorizes a direct client-to-Cloudinary upload.
 * Generates sorted Cloudinary signature and asset verification token.
 */
export function authorizeDirectUpload(
  user: ServerAuthUser,
  params: {
    purpose: UploadPurpose;
    extension: string;
    sizeBytes?: number;
  }
): DirectUploadAuthorization {
  const validation = validateUploadParameters(params);
  if (!validation.valid || !validation.policy) {
    throw new Error(validation.error || "Upload validation failed.");
  }

  const policy = validation.policy;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "campushive-dev";
  const apiKey = process.env.CLOUDINARY_API_KEY || "dev_key";
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.NODE_ENV === "production" && (!process.env.CLOUDINARY_CLOUD_NAME || !apiSecret)) {
    throw new Error("Cloud storage is unconfigured in production environment.");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const ext = params.extension.startsWith(".")
    ? params.extension.toLowerCase()
    : `.${params.extension.toLowerCase()}`;
  const resourceType = ext === ".pdf" ? "raw" : "image";

  // Server-controlled folder and unpredictable public ID
  const folder = `${policy.folderPrefix}/${user.id}`;
  const uuid = crypto.randomUUID();
  const publicId = `${policy.purpose}_${uuid}`;
  const type = policy.accessType;
  const allowedFormats = policy.allowedExtensions
    .map((e) => e.replace(/^\./, ""))
    .join(",");
  const maxFileSize = policy.maxSizeBytes;

  // Cloudinary signature parameters must be sorted alphabetically
  const signatureParams: Record<string, string> = {
    allowed_formats: allowedFormats,
    folder,
    max_file_size: String(maxFileSize),
    public_id: publicId,
    timestamp: String(timestamp),
  };
  if (type === "authenticated") {
    signatureParams.type = "authenticated";
  }

  const sortedPayload = Object.keys(signatureParams)
    .sort()
    .map((k) => `${k}=${signatureParams[k]}`)
    .join("&");

  const secretToUse = apiSecret || "mock_secret";
  const signature = crypto
    .createHash("sha1")
    .update(`${sortedPayload}${secretToUse}`)
    .digest("hex");

  const assetVerificationToken = generateAssetVerificationToken(
    user.id,
    policy.purpose,
    publicId,
    type
  );

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    cloudName,
    apiKey,
    timestamp,
    folder,
    publicId,
    type,
    resourceType,
    allowedFormats,
    maxFileSize,
    signature,
    assetVerificationToken,
  };
}
