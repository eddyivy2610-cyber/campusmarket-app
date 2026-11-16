import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  getConversationWithMessages,
  setBannerCollapsedState,
} from "../../../../lib/chatRepository";
import { ContextWorkflowStatus, MessageModel } from "../../../../models/ChatModels";
import UserModel from "../../../../models/User";
import StoreModel from "../../../../models/Store";
import { requireParticipant } from "../../../../lib/authServer";
import dbConnect from "../../../../lib/dbConnect";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user, errorResponse } = await requireParticipant(req, id, {
      allowInactiveCounterpart: true,
    });
    if (!user || errorResponse) {
      return errorResponse;
    }
    const userId = user.id;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10))
    );

    const result = getConversationWithMessages({
      conversationId: id,
      userId,
      page,
      limit,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Hydrate messages from MongoDB when in-memory repository is empty (serverless cold start / different instance)
    if (result.messages.length === 0) {
      try {
        await dbConnect();
        if (mongoose.connection.readyState === 1) {
          const skip = (page - 1) * limit;
          const totalDb = await MessageModel.countDocuments({ conversationId: id });
          if (totalDb > 0) {
            const dbMsgs = await MessageModel.find({ conversationId: id })
              .sort({ createdAt: -1, _id: -1 })
              .skip(skip)
              .limit(limit)
              .lean();
            result.messages = dbMsgs.reverse().map((m: any) => ({
              id: m.id || String(m._id),
              clientMessageId: m.clientMessageId,
              conversationId: String(m.conversationId || id),
              senderId: String(m.senderId),
              type: m.type || "text",
              text: m.text || "",
              attachment: m.attachment,
              attachedContext: m.attachedContext,
              deliveryStatus: m.deliveryStatus || "delivered",
              createdAt:
                m.createdAt instanceof Date
                  ? m.createdAt.toISOString()
                  : String(m.createdAt || new Date().toISOString()),
            }));
            result.totalMessages = totalDb;
            result.hasMore = skip + dbMsgs.length < totalDb;
          }
        }
      } catch (dbErr) {
        console.warn("[ConversationGET] MongoDB messages hydration failed:", dbErr);
      }
    }

    // Hydrate otherParticipant avatar from MongoDB if missing
    if (result.conversation?.otherParticipant && !result.conversation.otherParticipant.avatar) {
      try {
        await dbConnect();
        if (mongoose.connection.readyState === 1) {
          const otherId = String(result.conversation.otherParticipant.id || "");
          if (mongoose.isValidObjectId(otherId)) {
            const userDoc: any = await UserModel.findById(otherId)
              .select("avatar profile.avatar")
              .lean();
            const userAvatar = userDoc?.profile?.avatar || userDoc?.avatar;
            if (userAvatar) {
              result.conversation.otherParticipant.avatar = String(userAvatar);
            } else if (
              result.conversation.otherParticipant.accountType === "student_store" ||
              result.conversation.otherParticipant.accountType === "approved_business"
            ) {
              const storeDoc: any = await StoreModel.findOne({ ownerId: otherId })
                .select("logo")
                .lean();
              if (storeDoc?.logo) {
                result.conversation.otherParticipant.avatar = String(storeDoc.logo);
              }
            }
          }
        }
      } catch {}
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to load conversation messages" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user, errorResponse } = await requireParticipant(req, id, {
      allowInactiveCounterpart: true,
    });
    if (!user || errorResponse) {
      return errorResponse;
    }
    const userId = user.id;
    const body = await req.json();

    const collapsed =
      typeof body.collapsed === "boolean" ? body.collapsed : false;
    const contextStatus = body.contextStatus as
      | ContextWorkflowStatus
      | undefined;

    const updatedConversation = setBannerCollapsedState({
      conversationId: id,
      userId,
      collapsed,
      contextStatus,
    });

    return NextResponse.json({ conversation: updatedConversation });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "";
    if (errMessage === "FORBIDDEN_NOT_PARTICIPANT" || errMessage === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update conversation state" },
      { status: 500 }
    );
  }
}
