/**
 * app/api/realtime/auth/route.ts
 *
 * Realtime Channel Authorization Gate for Campus Hive.
 * Authorizes client subscriptions to private and presence channels.
 *
 * Security Requirements:
 * - Session verification (cryptographic JWT verification via requireAuth).
 * - Live account status check (suspended/banned accounts return 403).
 * - Conversation membership: Non-members CANNOT subscribe to private/presence conversation channels (403).
 * - User isolation: Users CANNOT subscribe to another user's private channel (403).
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "../../../lib/authServer";
import { authorizeChannel } from "../../../lib/realtimeServer";
import { getConversationDoc } from "../../../lib/chatRepository";
import { ConversationModel } from "../../../models/ChatModels";
import dbConnect from "../../../lib/dbConnect";

async function verifyConversationParticipant(
  conversationId: string,
  userId: string
): Promise<boolean> {
  // 1. Check in-memory / pre-seeded conversations
  const inMemory = process.env.NODE_ENV !== "production" && process.env.ALLOW_LOCAL_DB_FALLBACK === "true"
    ? getConversationDoc(conversationId)
    : null;
  if (inMemory) {
    return Array.isArray(inMemory.participantIds) && inMemory.participantIds.includes(userId);
  }

  // 2. Check canonical MongoDB collection "conversations"
  try {
    await dbConnect();
    const isObjectId = mongoose.isValidObjectId(conversationId);
    const filter: any = isObjectId
      ? { $or: [{ _id: new mongoose.Types.ObjectId(conversationId) }, { conversationId }] }
      : { conversationId };

    const doc = await ConversationModel.findOne(filter).select("participantIds participants").lean();
    if (!doc) return false;

    // Check participantIds (string array)
    if (Array.isArray(doc.participantIds) && doc.participantIds.includes(userId)) {
      return true;
    }

    // Check participants (ObjectId or object array)
    if (Array.isArray(doc.participants)) {
      const isParticipant = doc.participants.some((p: any) => {
        const id = p?._id ? p._id.toString() : p?.id ? p.id.toString() : p?.toString();
        return id === userId;
      });
      if (isParticipant) return true;
    }

    return false;
  } catch (err) {
    console.error("[RealtimeAuth] Failed to verify conversation participant:", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate session & enforce live account active status
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract socket_id and channel_name from request body (supports form-urlencoded & json)
    let socketId = "";
    let channelName = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      socketId = String(formData.get("socket_id") || "").trim();
      channelName = String(formData.get("channel_name") || "").trim();
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      socketId = String(body.socket_id || "").trim();
      channelName = String(body.channel_name || "").trim();
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      socketId = String(params.get("socket_id") || "").trim();
      channelName = String(params.get("channel_name") || "").trim();
    }

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: "socket_id and channel_name are required." },
        { status: 400 }
      );
    }

    // 3. Channel Authorization Checks
    if (channelName.startsWith("private-conversation-") || channelName.startsWith("presence-conversation-")) {
      const conversationId = channelName.replace(/^(private|presence)-conversation-/, "");
      if (!conversationId) {
        return NextResponse.json({ error: "Invalid conversation channel." }, { status: 400 });
      }

      const isParticipant = await verifyConversationParticipant(conversationId, user.id);
      if (!isParticipant) {
        return NextResponse.json(
          { error: "Forbidden: You are not a participant in this conversation." },
          { status: 403 }
        );
      }
    } else if (channelName.startsWith("private-user-")) {
      const targetUserId = channelName.replace(/^private-user-/, "");
      if (targetUserId !== user.id) {
        return NextResponse.json(
          { error: "Forbidden: You can only subscribe to your own private user channel." },
          { status: 403 }
        );
      }
    } else {
      // Unrecognized channel namespace
      return NextResponse.json(
        { error: "Forbidden: Unauthorized channel namespace." },
        { status: 403 }
      );
    }

    // 4. Generate signed cryptographic authorization payload
    const authData = authorizeChannel({
      socketId,
      channelName,
      user: {
        id: user.id,
        name: user.name,
        avatar: (user as any).avatar,
        accountType: user.role,
      },
    });

    return NextResponse.json(authData);
  } catch (error: any) {
    console.error("[RealtimeAuth] Error authorizing channel:", error);
    return NextResponse.json(
      { error: "Internal server error during channel authorization." },
      { status: 500 }
    );
  }
}
