import crypto from "node:crypto";
import { env } from "./env";

export interface ServerAuthUser {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  isStudent: boolean;
  studentVerified: boolean;
  campus?: string;
  tokenVersion?: number;
}

export const AUTH_ISSUER = "campushive.edu.ng";
export const AUTH_AUDIENCE = "campushive-api";

// Short-lived access token: 15 minutes (900 seconds)
export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;

// Long-lived refresh token: 7 days (604,800 seconds)
export const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600;

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

/**
 * Returns the secret key for signing and verifying tokens.
 * Enforces minimum 32-byte length for HS256 cryptographic security.
 */
export function getAuthSecret(): string {
  return env.AUTH_SECRET;
}

function toBase64Url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromBase64Url(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

function hmacSha256Base64Url(data: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Creates a short-lived cryptographically signed access JWT (default 15 minutes).
 * Includes standard claims: iss, aud, sub, iat, exp, tokenType: "access".
 */
export function createAuthToken(
  user: ServerAuthUser,
  expiresInSeconds: number = ACCESS_TOKEN_EXPIRY_SECONDS
): string {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    iss: AUTH_ISSUER,
    aud: AUTH_AUDIENCE,
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isStudent: Boolean(user.isStudent),
    studentVerified: Boolean(user.studentVerified),
    campus: user.campus || undefined,
    tokenType: "access",
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = hmacSha256Base64Url(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export const createAccessToken = createAuthToken;

/**
 * Creates a cryptographically signed refresh JWT (default 7 days).
 * Marked with tokenType: "refresh" to prevent token confusion attacks.
 */
export function createRefreshToken(
  user: ServerAuthUser,
  expiresInSeconds: number = REFRESH_TOKEN_EXPIRY_SECONDS
): string {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    iss: AUTH_ISSUER,
    aud: AUTH_AUDIENCE,
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isStudent: Boolean(user.isStudent),
    studentVerified: Boolean(user.studentVerified),
    campus: user.campus || undefined,
    tokenVersion: typeof user.tokenVersion === "number" ? user.tokenVersion : 0,
    tokenType: "refresh",
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = hmacSha256Base64Url(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Strictly verifies an access token:
 * 1. Cryptographic HMAC-SHA256 signature verification (timingSafeEqual).
 * 2. Header algorithm check (prevents alg: none or substitution).
 * 3. Issuer check (iss === campushive.edu.ng).
 * 4. Audience check (aud === campushive-api).
 * 5. Expiration check (exp > now).
 * 6. Disallows refresh tokens (tokenType !== "refresh").
 *
 * Returns typed ServerAuthUser if valid, null otherwise.
 */
export function verifyAuthToken(token: string): ServerAuthUser | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, receivedSignature] = parts;

  try {
    const secret = getAuthSecret();
    const expectedSignature = hmacSha256Base64Url(
      `${encodedHeader}.${encodedPayload}`,
      secret
    );

    // Cryptographic timing-safe comparison to prevent timing attacks
    const receivedBuf = Buffer.from(receivedSignature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (
      receivedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(receivedBuf, expectedBuf)
    ) {
      return null; // Signature mismatch (forged token)
    }

    // Parse header and verify algorithm
    const header = JSON.parse(fromBase64Url(encodedHeader));
    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null; // Disallowed algorithm or header type
    }

    // Parse payload and verify standard claims
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    // Verify Issuer
    if (payload.iss !== AUTH_ISSUER) {
      return null;
    }

    // Verify Audience
    if (payload.aud !== AUTH_AUDIENCE) {
      return null;
    }

    // Verify Expiration
    if (typeof payload.exp !== "number" || payload.exp <= now) {
      return null; // Expired token
    }

    // Verify Subject
    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }

    // Refresh token cannot be used as an access token
    if (payload.tokenType && payload.tokenType !== "access") {
      return null;
    }

    const validRoles = ["buyer", "seller", "admin"];
    const role = validRoles.includes(payload.role) ? payload.role : "buyer";

    return {
      id: payload.sub,
      name: String(payload.name || "Campus Member"),
      email: String(payload.email || `${payload.sub}@campushive.edu.ng`),
      role: role as "buyer" | "seller" | "admin",
      isStudent: Boolean(payload.isStudent ?? true),
      studentVerified: Boolean(payload.studentVerified ?? false),
      campus: payload.campus ? String(payload.campus) : undefined,
      tokenVersion: typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0,
    };
  } catch {
    // Malformed JSON, decoding error, etc.
    return null;
  }
}

/**
 * Strictly verifies a refresh token:
 * 1. Cryptographic HMAC-SHA256 signature verification.
 * 2. Algorithm and header type validation.
 * 3. Issuer, audience, and expiration checks.
 * 4. Strictly checks tokenType === "refresh" (access tokens cannot be used to refresh).
 *
 * Returns typed ServerAuthUser if valid, null otherwise.
 */
export function verifyRefreshToken(token: string): ServerAuthUser | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, receivedSignature] = parts;

  try {
    const secret = getAuthSecret();
    const expectedSignature = hmacSha256Base64Url(
      `${encodedHeader}.${encodedPayload}`,
      secret
    );

    const receivedBuf = Buffer.from(receivedSignature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (
      receivedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(receivedBuf, expectedBuf)
    ) {
      return null;
    }

    const header = JSON.parse(fromBase64Url(encodedHeader));
    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const payload = JSON.parse(fromBase64Url(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.iss !== AUTH_ISSUER) {
      return null;
    }

    if (payload.aud !== AUTH_AUDIENCE) {
      return null;
    }

    if (typeof payload.exp !== "number" || payload.exp <= now) {
      return null;
    }

    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }

    // Must be explicitly a refresh token
    if (payload.tokenType !== "refresh") {
      return null;
    }

    const validRoles = ["buyer", "seller", "admin"];
    const role = validRoles.includes(payload.role) ? payload.role : "buyer";

    return {
      id: payload.sub,
      name: String(payload.name || "Campus Member"),
      email: String(payload.email || `${payload.sub}@campushive.edu.ng`),
      role: role as "buyer" | "seller" | "admin",
      isStudent: Boolean(payload.isStudent ?? true),
      studentVerified: Boolean(payload.studentVerified ?? false),
      campus: payload.campus ? String(payload.campus) : undefined,
      tokenVersion: typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Cookie options for the refresh token.
 * Defaults to httpOnly: true, SameSite: lax, secure: true (in production).
 */
export interface RefreshTokenCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
}

export function getRefreshTokenCookieOptions(
  maxAgeSeconds: number = REFRESH_TOKEN_EXPIRY_SECONDS,
  secureOverride?: boolean
): RefreshTokenCookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  const secure = secureOverride !== undefined ? secureOverride : isProd;
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * Sets the httpOnly, Secure, SameSite refresh token cookie on a NextResponse.
 */
export function setRefreshTokenCookie(
  res: any,
  refreshToken: string,
  options?: Partial<RefreshTokenCookieOptions>
): void {
  const defaultOptions = getRefreshTokenCookieOptions();
  res.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...defaultOptions,
    ...options,
  });
}

/**
 * Clears the refresh token cookie on a NextResponse.
 */
export function clearRefreshTokenCookie(
  res: any,
  options?: Partial<RefreshTokenCookieOptions>
): void {
  const defaultOptions = getRefreshTokenCookieOptions(0);
  res.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", {
    ...defaultOptions,
    ...options,
    maxAge: 0,
  });
}

/**
 * Extracts the refresh token from a NextRequest's cookies.
 */
export function getRefreshTokenFromRequest(req: any): string | null {
  return (
    req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value ||
    req.cookies.get("campus_refresh_token")?.value ||
    null
  );
}
