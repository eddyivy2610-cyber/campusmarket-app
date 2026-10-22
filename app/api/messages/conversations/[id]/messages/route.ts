import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  appendMessageToConversation,
  getConversationWithMessages,
} from "../../../../../lib/chatRepository";
import { MessageModel, ConversationModel } from "../../../../../models/ChatModels";
import { requireParticipant } from "../../../../../lib/authServer";
import dbConnect from "../../../../../lib/dbConnect";
import {
  publishConversationEvent,
  publishUserEvent,
} from "../../../../../lib/realtimeServer";
import { createNotification } from "../../../../../lib/notificationService";

const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params;
    const { user, errorResponse } = await requireParticipant(req, conversationId, {
      allowInactiveCounterpart: true,
    });
    if (!user || errorResponse) {
      return errorResponse;
    }

    const { searchParams } = new URL(req.url);
    const sinceId = searchParams.get("sinceId");
    const beforeId = searchParams.get("before") || searchParams.get("cursor");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    await dbConnect();

    // 1. Reconnect Recovery: If sinceId is provided, retrieve messages newer than sinceId
    if (sinceId && mongoose.connection.readyState === 1) {
      try {
        const pivotMsg = await MessageModel.findOne({
          $or: [
            { id: sinceId },
            ...(mongoose.isValidObjectId(sinceId) ? [{ _id: new mongoose.Types.ObjectId(sinceId) }] : []),
          ],
        }).select("createdAt _id").lean();

        if (pivotMsg) {
          const newerMessages = await MessageModel.find({
            conversationId,
            $or: [
              { createdAt: { $gt: pivotMsg.createdAt } },
              { createdAt: pivotMsg.createdAt, _id: { $gt: pivotMsg._id } },
            ],
          })
            .sort({ createdAt: 1, _id: 1 })
            .limit(limit)
            .lean();

          return NextResponse.json({
            conversationId,
            sinceId,
            messages: newerMessages.map((m: any) => ({
              id: m.id || m._id.toString(),
              clientMessageId: m.clientMessageId,
              conversationId: m.conversationId?.toString() || conversationId,
              senderId: m.senderId?.toString(),
              type: m.type || "text",
              text: m.text,
              attachment: m.attachment,
              attachedContext: m.attachedContext,
              deliveryStatus: m.deliveryStatus || "delivered",
              createdAt: (m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt) || new Date().toISOString(),
            })),
          });
        }
      } catch (dbErr) {
        console.warn("[MessagesGET] MongoDB sinceId lookup fallback to in-memory:", dbErr);
      }
    }

    // 2. Cursor Pagination (Backward / History): If beforeId or cursor is provided
    if (beforeId && mongoose.connection.readyState === 1) {
      try {
        const pivotMsg = await MessageModel.findOne({
          $or: [
            { id: beforeId },
            ...(mongoose.isValidObjectId(beforeId) ? [{ _id: new mongoose.Types.ObjectId(beforeId) }] : []),
          ],
        }).select("createdAt _id").lean();

        if (pivotMsg) {
          const olderMessages = await MessageModel.find({
            conversationId,
            $or: [
              { createdAt: { $lt: pivotMsg.createdAt } },
              { createdAt: pivotMsg.createdAt, _id: { $lt: pivotMsg._id } },
            ],
          })
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1)
            .lean();

          const hasMore = olderMessages.length > limit;
          const paginated = hasMore ? olderMessages.slice(0, limit) : olderMessages;
          const nextCursor = hasMore && paginated.length > 0 ? paginated[paginated.length - 1].id || paginated[paginated.length - 1]._id.toString() : null;

          return NextResponse.json({
            conversationId,
            messages: paginated.reverse().map((m: any) => ({
              id: m.id || m._id.toString(),
              clientMessageId: m.clientMessageId,
              conversationId: m.conversationId?.toString() || conversationId,
              senderId: m.senderId?.toString(),
              type: m.type || "text",
              text: m.text,
              attachment: m.attachment,
              attachedContext: m.attachedContext,
              deliveryStatus: m.deliveryStatus || "delivered",
              createdAt: (m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt) || new Date().toISOString(),
            })),
            nextCursor,
            hasMore,
          });
        }
      } catch (dbErr) {
        console.warn("[MessagesGET] MongoDB beforeId lookup fallback to in-memory:", dbErr);
      }
    }

    // Default repository fallback
    const result = getConversationWithMessages({
      conversationId,
      userId: user.id,
      limit,
    });

    if (!result) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND") {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to load messages." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params;
    const { user, errorResponse } = await requireParticipant(req, conversationId);
    if (!user || errorResponse) {
      return errorResponse;
    }
    const senderId = user.id;
    const body = await req.json();

    const rawText = typeof body.text === "string" ? body.text.trim() : "";
    const clientMessageId =
      typeof body.clientMessageId === "string"
        ? body.clientMessageId.trim().slice(0, 80)
        : undefined;

    let validatedAttachment:
      | {
          url: string;
          fileName: string;
          mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
          sizeBytes: number;
        }
      | undefined;

    if (body.attachment) {
      const { url, fileName, mimeType, sizeBytes } = body.attachment;

      if (
        !mimeType ||
        !ALLOWED_IMAGE_MIMES.includes(
          mimeType as (typeof ALLOWED_IMAGE_MIMES)[number]
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Unsupported attachment type. Only JPEG, PNG, WEBP, and GIF images are allowed.",
          },
          { status: 400 }
        );
      }

      const numericSize = Number(sizeBytes || 0);
      if (numericSize <= 0 || numericSize > MAX_ATTACHMENT_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: "Attachment exceeds the 5 MB maximum file size limit.",
          },
          { status: 400 }
        );
      }

      if (!url || typeof url !== "string") {
        return NextResponse.json(
          { error: "Invalid attachment image payload." },
          { status: 400 }
        );
      }

      validatedAttachment = {
        url,
        fileName: String(fileName || "campus-photo.jpg").slice(0, 120),
        mimeType: mimeType as (typeof ALLOWED_IMAGE_MIMES)[number],
        sizeBytes: numericSize,
      };
    }

    if (!rawText && !validatedAttachment) {
      return NextResponse.json(
        { error: "Message text or a valid image attachment is required." },
        { status: 400 }
      );
    }

    if (rawText.length > 2000) {
      return NextResponse.json(
        { error: "Message text cannot exceed 2,000 characters." },
        { status: 400 }
      );
    }

    // =========================================================================
    // STEP 1: PERSISTENCE-FIRST RULE
    // Message MUST be persisted to MongoDB before any realtime publication attempt.
    // If the database write fails, the provider is NEVER invoked.
    // =========================================================================
    await dbConnect();
    let isDbDuplicate = false;

    if (mongoose.connection.readyState === 1 && clientMessageId) {
      const existingDb = await MessageModel.findOne({ clientMessageId }).lean();
      if (existingDb) {
        isDbDuplicate = true;
      }
    }

    // Append to conversation repository
    const result = appendMessageToConversation({
      conversationId,
      senderId,
      text: rawText,
      clientMessageId,
      attachment: validatedAttachment,
      attachedContext: body.attachedContext || undefined,
    });

    const isDuplicate = result.duplicate || isDbDuplicate;

    // Persist to MongoDB collection "messages"
    if (!isDuplicate && mongoose.connection.readyState === 1) {
      try {
        await MessageModel.create({
          id: result.message.id,
          clientMessageId,
          conversationId: String(conversationId),
          senderId: String(senderId),
          type: result.message.type,
          text: result.message.text,
          attachment: validatedAttachment,
          attachedContext: body.attachedContext || undefined,
          deliveryStatus: "delivered",
          schemaVersion: 1,
          createdAt: new Date().toISOString(),
        } as any);

        // Update MongoDB collection "conversations" lastMessage metadata
        const isConvObjId = mongoose.isValidObjectId(conversationId);
        await ConversationModel.updateOne(
          isConvObjId
            ? { $or: [{ _id: new mongoose.Types.ObjectId(conversationId) }, { conversationId }] }
            : { conversationId },
          {
            $set: {
              lastMessage: {
                text: result.message.text,
                senderId: mongoose.isValidObjectId(senderId)
                  ? new mongoose.Types.ObjectId(senderId)
                  : senderId,
                createdAt: new Date().toISOString(),
                time: new Date(),
                type: result.message.type,
              },
              updatedAt: new Date(),
            },
          }
        );
      } catch (dbErr: any) {
        if (dbErr?.code === 11000) {
          // Unique index conflict caught -> duplicate write
          return NextResponse.json(result, { status: 200 });
        }
        console.error("[MessagesPOST] MongoDB persistence failed:", dbErr);
        // Abort immediately: publication is never triggered if DB write fails
        return NextResponse.json(
          { error: "Database persistence failed. Message was not sent." },
          { status: 500 }
        );
      }
    }

    // =========================================================================
    // STEP 2: REALTIME PUBLICATION
    // Only published after successful database persistence.
    // Publication errors are caught and logged without losing the saved message.
    // =========================================================================
    let realtimePublished = false;

    if (!isDuplicate) {
      const counterpartId = result.conversation.otherParticipant?.id;

      // Publish on conversation channel
      const pubResult = await publishConversationEvent(conversationId, "new-message", {
        message: result.message,
        conversation: result.conversation,
      });

      realtimePublished = pubResult.published;

      // Publish on counterpart user channel (inbox update)
      if (counterpartId) {
        await publishUserEvent(counterpartId, "conversation-updated", {
          conversationId,
          lastMessage: result.conversation.lastMessage,
          unreadCount: 1,
        });
        try {
          await createNotification({
            recipient: counterpartId,
            sender: senderId,
            type: "new_message",
            category: "messages",
            priority: "high",
            title: "New message",
            message: "You have a new message in a conversation.",
            link: `/messages?conversation=${encodeURIComponent(conversationId)}`,
            dedupeKey: clientMessageId ? `message:${clientMessageId}` : undefined,
          });
        } catch (notificationError) {
          console.warn("[Notifications] Message notification failed:", notificationError);
        }
      }

      if (!realtimePublished) {
        console.warn(
          `[RealtimeOutbox] Publication failed for message ${result.message.id}. Saved in DB and recoverable on client cursor reconnect.`
        );
      }
    }

    return NextResponse.json(
      {
        ...result,
        realtimePublished,
      },
      {
        status: isDuplicate ? 200 : 201,
      }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
