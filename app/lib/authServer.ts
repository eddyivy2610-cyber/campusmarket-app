import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import StoreModel, { IStoreDocument } from "../models/Store";
import UserModel, { User } from "../models/User";
import dbConnect from "./dbConnect";
import { databaseUnavailableResponse } from "./databaseErrors";
import { verifyAuthToken, verifyRefreshToken, getRefreshTokenFromRequest, ServerAuthUser } from "./authTokens";
import { getConversationDoc, ensureParticipant, registerConversationDoc } from "./chatRepository";
import { IConversationDoc, ConversationModel } from "../models/ChatModels";

export type { ServerAuthUser };

/**
 * Resolves the authenticated user from server-side request context.
 * Strictly verifies JWT signature, issuer, audience, and expiry.
 * NEVER trusts spoofable headers (x-campus-*) or unauthenticated fallbacks.
 */
export function getServerAuthUser(req: NextRequest): ServerAuthUser | null {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ") || authHeader?.startsWith("bearer ")) {
    const headerToken = authHeader.substring(7).trim();
    if (!headerToken) return null;
    // Cryptographically verifies HMAC signature, claims (iss, aud, exp), and tokenType !== "refresh"
    return verifyAuthToken(headerToken);
  }

  // Check short-lived access token cookie first
  const cookieToken =
    req.cookies.get("campus_token")?.value || req.cookies.get("token")?.value;
  if (cookieToken) {
    const verifiedAccess = verifyAuthToken(cookieToken.trim());
    if (verifiedAccess) {
      return verifiedAccess;
    }
  }

  // Fallback to httpOnly refresh token cookie when the 15-minute access cookie has expired
  const refreshCookie = getRefreshTokenFromRequest(req);
  if (refreshCookie) {
    return verifyRefreshToken(refreshCookie.trim());
  }

  return null;
}

/**
 * Guard: Enforce authenticated session
 * Validates token cryptographic claims and checks live MongoDB account status.
 */
export async function requireAuth(req: NextRequest): Promise<{
  user: ServerAuthUser | null;
  errorResponse?: NextResponse;
}> {
  const user = getServerAuthUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required to perform this action." },
        { status: 401 }
      ),
    };
  }

  if (user.emailVerified === false) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Email verification is required." },
        { status: 403 }
      ),
    };
  }

  // Live database account status re-check (blocks suspended and banned accounts immediately)
  let dbConnection;
  try { dbConnection = await dbConnect(); }
  catch { return { user: null, errorResponse: databaseUnavailableResponse() }; }
  if (process.env.NODE_ENV === "production" && (!dbConnection || mongoose.connection.readyState !== 1)) {
    return { user: null, errorResponse: NextResponse.json({ success: false, error: "Authentication service temporarily unavailable." }, { status: 503 }) };
  }
  const isUserDbAvailable =
    typeof window === "undefined" &&
    (UserModel.db?.readyState === 1 ||
      Object.prototype.hasOwnProperty.call(UserModel, "findOne") ||
      Object.prototype.hasOwnProperty.call(UserModel, "findById"));
  if (isUserDbAvailable) {
    try {
      const dbUser = mongoose.isValidObjectId(user.id)
        ? await User.findById(user.id).select("role accountStatus emailVerified isStudent studentVerified campus onboardingStep tokenVersion").lean()
        : await User.findOne({ email: user.email.toLowerCase() }).select("role accountStatus emailVerified isStudent studentVerified campus onboardingStep tokenVersion").lean();
      if (dbUser && dbUser.emailVerified === false) {
        return {
          user: null,
          errorResponse: NextResponse.json(
            { success: false, error: "Email verification is required." },
            { status: 403 }
          ),
        };
      }
      if (dbUser && dbUser.accountStatus !== "active") {
        return {
          user: null,
          errorResponse: NextResponse.json(
            {
              success: false,
              error: `Forbidden: Account is ${dbUser.accountStatus || "inactive"}. Please contact support.`,
            },
            { status: 403 }
          ),
        };
      }
      if (
        dbUser &&
        typeof user.tokenVersion === "number" &&
        typeof (dbUser as any).tokenVersion === "number" &&
        user.tokenVersion !== (dbUser as any).tokenVersion
      ) {
        return {
          user: null,
          errorResponse: NextResponse.json(
            { success: false, error: "Session has expired or was revoked. Please log in again." },
            { status: 401 }
          ),
        };
      }
      if (dbUser) {
        user.role = dbUser.role as ServerAuthUser["role"];
        user.isStudent = Boolean(dbUser.isStudent);
        user.studentVerified = Boolean(dbUser.studentVerified);
        user.campus = dbUser.campus;
      }
    } catch {
      if (process.env.NODE_ENV === "production") {
        return { user: null, errorResponse: NextResponse.json({ success: false, error: "Authentication service temporarily unavailable." }, { status: 503 }) };
      }
    }
  }

  return { user };
}

export async function requireCompletedOnboarding(req: NextRequest): Promise<{
  user: ServerAuthUser | null;
  errorResponse?: NextResponse;
}> {
  const auth = await requireAuth(req);
  if (!auth.user || auth.errorResponse) return auth;

  let dbConnection;
  try { dbConnection = await dbConnect(); }
  catch { return { user: null, errorResponse: databaseUnavailableResponse() }; }
  if (process.env.NODE_ENV === "production" && (!dbConnection || mongoose.connection.readyState !== 1)) {
    return { user: null, errorResponse: NextResponse.json({ success: false, error: "Authentication service temporarily unavailable." }, { status: 503 }) };
  }
  const record = await User.findById(auth.user.id).select("onboardingStep").lean();
  const allowed = ["profile_completed", "onboarding_choice", "seller_pending", "completed"];
  if (!record || !allowed.includes(String(record.onboardingStep || "pending"))) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Complete your profile setup before using this feature." },
        { status: 403 }
      ),
    };
  }
  return auth;
}

/**
 * Guard: Enforce admin role
 * Verifies token admin claim and verifies live database role and active account status.
 * Prevents demoted admins from continuing access during the token lifetime.
 */
export async function requireAdmin(req: NextRequest): Promise<{
  admin: ServerAuthUser | null;
  errorResponse?: NextResponse;
}> {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) {
    return { admin: null, errorResponse: errorResponse };
  }

  if (user.role !== "admin") {
    return {
      admin: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Forbidden: Admin authorization required.",
        },
        { status: 403 }
      ),
    };
  }

  // Live database role and account status re-check
  try { await dbConnect(); }
  catch { return { admin: null, errorResponse: databaseUnavailableResponse() }; }
  const isAdminDbAvailable =
    typeof window === "undefined" &&
    (UserModel.db?.readyState === 1 ||
      Object.prototype.hasOwnProperty.call(UserModel, "findOne") ||
      Object.prototype.hasOwnProperty.call(UserModel, "findById"));
  if (isAdminDbAvailable) {
    try {
      const dbUser = mongoose.isValidObjectId(user.id)
        ? await User.findById(user.id).select("role accountStatus").lean()
        : await User.findOne({ email: user.email.toLowerCase() }).select("role accountStatus").lean();
      if (!dbUser || dbUser.role !== "admin" || dbUser.accountStatus !== "active") {
        return {
          admin: null,
          errorResponse: NextResponse.json(
            {
              success: false,
              error: "Forbidden: Admin authorization revoked or account inactive.",
            },
            { status: 403 }
          ),
        };
      }
    } catch {
      return { admin: null, errorResponse: databaseUnavailableResponse() };
    }
  }

  return { admin: user };
}

/**
 * Guard: Enforce conversation membership
 * Verifies that the caller is authenticated and is a designated participant of the conversation.
 * Blocks in-flight mutating activity (deals, offers, messages) if the other participant's account is suspended or banned.
 */
export async function requireParticipant(
  req: NextRequest,
  conversationId: string,
  options?: { allowInactiveCounterpart?: boolean }
): Promise<{
  user: ServerAuthUser | null;
  conversation: IConversationDoc | null;
  errorResponse?: NextResponse;
}> {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) {
    return { user: null, conversation: null, errorResponse };
  }

  let conversation = getConversationDoc(conversationId);

  // Fallback to MongoDB collection "conversations" if not present in-memory
  if (!conversation) {
    await dbConnect();
    if (typeof window === "undefined" && mongoose.connection.readyState === 1) {
      try {
        const isObjectId = mongoose.isValidObjectId(conversationId);
        const filter: any = isObjectId
          ? { $or: [{ _id: new mongoose.Types.ObjectId(conversationId) }, { conversationId }] }
          : { conversationId };

        const dbDoc = await ConversationModel.findOne(filter).lean();
        if (dbDoc) {
          const stringIds =
            Array.isArray(dbDoc.participantIds) && dbDoc.participantIds.length > 0
              ? dbDoc.participantIds
              : (dbDoc.participants || []).map((p: any) => String(p?._id || p?.id || p));

          const mappedDoc: IConversationDoc = {
            conversationId: dbDoc.conversationId || dbDoc._id.toString(),
            participantIds: stringIds,
            participants: dbDoc.participants || [],
            context: dbDoc.context || null,
            additionalContexts: dbDoc.additionalContexts || [],
            collapsedBy: dbDoc.collapsedBy || [],
            unreadCounts: dbDoc.unreadCounts || {},
            lastMessage: dbDoc.lastMessage || null,
            status: dbDoc.status || "active",
            schemaVersion: dbDoc.schemaVersion || 1,
            createdAt: dbDoc.createdAt || new Date(),
            updatedAt: dbDoc.updatedAt || new Date(),
          } as any;

          registerConversationDoc(conversationId, mappedDoc);
          if (dbDoc._id) {
            registerConversationDoc(dbDoc._id.toString(), mappedDoc);
          }
          conversation = mappedDoc;
        }
      } catch {
        // Fallback
      }
    }
  }

  // Non-members get 404 to strictly prevent conversation ID enumeration
  if (!conversation || !ensureParticipant(conversation, user.id)) {
    return {
      user,
      conversation: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Conversation not found." },
        { status: 404 }
      ),
    };
  }

  // Block in-flight actions (deals, offers, new messages) if counterpart account is suspended/banned
  if (!options?.allowInactiveCounterpart) {
    const counterpartId = conversation.participantIds.find((id) => id !== user.id);
    if (counterpartId) {
      await dbConnect();
      const isUserDbAvailable =
        typeof window === "undefined" &&
        (UserModel.db?.readyState === 1 ||
          Object.prototype.hasOwnProperty.call(UserModel, "findOne") ||
          Object.prototype.hasOwnProperty.call(UserModel, "findById"));

      if (isUserDbAvailable) {
        try {
          const counterpart = mongoose.isValidObjectId(counterpartId)
            ? await User.findById(counterpartId).select("accountStatus").lean()
            : await User.findOne({ _id: counterpartId }).select("accountStatus").lean();

          if (counterpart && counterpart.accountStatus !== "active") {
            return {
              user,
              conversation,
              errorResponse: NextResponse.json(
                {
                  success: false,
                  error: `Action blocked: The other participant's account is ${counterpart.accountStatus}.`,
                },
                { status: 403 }
              ),
            };
          }
        } catch {
          // offline fallback
        }
      }
    }
  }

  return { user, conversation };
}

/**
 * Student-Vendor Eligibility Validator:
 * Validates based on existing student verification data and checks that
 * account does NOT already own an active or pending storefront.
 */
export async function checkStudentVendorEligibility(
  user: ServerAuthUser
): Promise<{
  eligible: boolean;
  status?: number;
  reason?: string;
  existingStore?: IStoreDocument | null;
}> {
  // 1. Check existing student verification
  if (!user.isStudent || !user.studentVerified) {
    return {
      eligible: false,
      status: 403,
      reason:
        "Student eligibility verification required. You must complete campus student verification before opening a student storefront.",
    };
  }

  // 2. Check if account already owns a storefront (One storefront per account)
  await dbConnect();
  const isStoreDbAvailable =
    typeof window === "undefined" &&
    (StoreModel.db?.readyState === 1 ||
      Object.prototype.hasOwnProperty.call(StoreModel, "findById") ||
      Object.prototype.hasOwnProperty.call(StoreModel, "findOne"));
  if (isStoreDbAvailable) {
    try {
      const existingStore = await StoreModel.findOne({ ownerId: user.id });
      if (existingStore) {
        return {
          eligible: false,
          status: 409,
          reason:
            "Account already owns a storefront. Each Campus Hive account is limited to one storefront.",
          existingStore,
        };
      }
    } catch {
      // offline fallback
    }
  }

  return { eligible: true };
}

/**
 * Store Ownership & State Guard:
 * Resolves store, verifies authenticated user is the owner, and checks permitted store status.
 * STRICT SECURITY: Suspended stores cannot publish or associate new catalog items!
 */
export async function assertUserOwnsStore(
  userId: string,
  storeId: string,
  options: { checkSuspended?: boolean } = { checkSuspended: true }
): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
  store?: any;
}> {
  await dbConnect();

  let store: any = null;
  const isStoreDbAvailable =
    typeof window === "undefined" &&
    (StoreModel.db?.readyState === 1 ||
      Object.prototype.hasOwnProperty.call(StoreModel, "findById") ||
      Object.prototype.hasOwnProperty.call(StoreModel, "findOne"));
  if (isStoreDbAvailable) {
    try {
      store = await StoreModel.findById(storeId);
    } catch {
      store = null;
    }
  }

  if (!store) {
    return { ok: false, status: 404, error: "Storefront not found." };
  }

  if (store.ownerId !== userId) {
    return {
      ok: false,
      status: 403,
      error: "Forbidden: You do not have permission to manage this storefront.",
    };
  }

  if (options.checkSuspended && store.status === "suspended") {
    return {
      ok: false,
      status: 403,
      error:
        "Forbidden: This storefront is currently suspended. Suspended storefronts cannot publish or associate catalog items.",
      store,
    };
  }

  return { ok: true, store };
}
