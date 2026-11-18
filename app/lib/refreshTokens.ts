import crypto from "node:crypto";
import RefreshTokenModel, { RefreshTokenFamily } from "@/models/RefreshToken";
import { REFRESH_TOKEN_EXPIRY_SECONDS } from "@/lib/authTokens";

export function hashOpaqueRefreshToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateOpaqueRefreshToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(64).toString("base64url");
  return { token, tokenHash: hashOpaqueRefreshToken(token) };
}

export async function issueTrackedRefreshToken(
  userId: string,
  familyId?: string,
  tokenVersion = 0
): Promise<{ token: string; familyId: string }> {
  const { token, tokenHash } = generateOpaqueRefreshToken();
  const resolvedFamilyId = familyId || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);

  if (!familyId) {
    await RefreshTokenFamily.updateOne(
      { familyId: resolvedFamilyId },
      { $setOnInsert: { familyId: resolvedFamilyId, userId, revokedAt: null, createdAt: new Date() } },
      { upsert: true }
    );
  }

  await RefreshTokenModel.create({
    tokenHash,
    userId,
    familyId: resolvedFamilyId,
    tokenVersion,
    expiresAt,
  });

  return { token, familyId: resolvedFamilyId };
}

export async function isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
  const fam = await RefreshTokenFamily.findOne({ familyId, revokedAt: { $ne: null } }).lean();
  return Boolean(fam);
}

export async function revokeRefreshTokenFamily(familyId: string, now = new Date()): Promise<void> {
  await Promise.all([
    RefreshTokenFamily.updateOne(
      { familyId },
      { $set: { revokedAt: now } },
      { upsert: true }
    ),
    RefreshTokenModel.updateMany(
      { familyId, revokedAt: null },
      { $set: { revokedAt: now } }
    ),
  ]);
}
