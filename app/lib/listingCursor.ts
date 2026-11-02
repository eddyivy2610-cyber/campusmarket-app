import mongoose from "mongoose";

/**
 * Encodes compound cursor (createdAt, _id) as URL-safe string.
 */
export function encodeListingCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}::${id}`).toString("base64url");
}

export interface DecodedListingCursor {
  createdAt: string;
  id: mongoose.Types.ObjectId;
}

/**
 * Decodes compound cursor into { createdAt, id: ObjectId }.
 * Validates base64 encoding, timestamp validity, and ObjectId formatting defensively.
 */
export function decodeListingCursor(cursor: string): DecodedListingCursor | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const parts = raw.split("::");
    if (parts.length !== 2) return null;
    const [createdAt, idStr] = parts;
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return null;
    if (!mongoose.Types.ObjectId.isValid(idStr)) return null;
    return { createdAt, id: new mongoose.Types.ObjectId(idStr) };
  } catch {
    return null;
  }
}
